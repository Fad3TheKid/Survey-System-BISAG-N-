const express = require('express');
const Response = require('../models/Response');
const Form = require('../models/Form');
const User = require('../models/User');
const router = express.Router();

// Dashboard summary route
router.get('/summary', async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const totalForms = await Form.countDocuments();
    const totalResponses = await Response.countDocuments();

    res.json({ totalEmployees, totalForms, totalResponses });
  } catch (error) {
    console.error('Summary Error:', error);
    res.status(500).json({ message: 'Failed to fetch summary' });
  }
});

// Get all responses with filter
router.get('/', async (req, res) => {
  try {
    const { level, department, designation, respondentEmail } = req.query;

    console.log('Filter params:', { level, department, designation, respondentEmail });

    const formFilter = {};
    if (level) formFilter.targetLevels = { $in: [level] };
    if (department) formFilter.targetDepartments = { $in: [department] };
    if (designation) formFilter.targetDesignations = { $in: [designation] };

    // If no filters, get all forms
    const forms = Object.keys(formFilter).length > 0
      ? await Form.find(formFilter).lean()
      : await Form.find({}).lean();

    console.log('Matched forms:', forms.map(f => ({
      _id: f._id,
      title: f.title,
      targetLevels: f.targetLevels,
      targetDepartments: f.targetDepartments,
      targetDesignations: f.targetDesignations,
    })));

    const formIds = forms.map(f => f._id);

    const responseFilter = { formId: { $in: formIds } };
    if (respondentEmail) {
      responseFilter.respondentEmail = respondentEmail;
    }

    const responses = await Response.find(responseFilter).lean();

    const formMap = forms.reduce((acc, form) => {
      acc[form._id.toString()] = form.title;
      return acc;
    }, {});

    const emails = [...new Set(responses.map(r => r.respondentEmail).filter(Boolean))];
    const users = await User.find({ email: { $in: emails } }).lean();
    const userMap = users.reduce((acc, user) => {
      acc[user.email] = user.username;
      return acc;
    }, {});

    // Aggregate counts by level, department, designation
    const countsByLevel = await Response.aggregate([
      { $match: responseFilter },
      {
        $lookup: {
          from: 'forms',
          localField: 'formId',
          foreignField: '_id',
          as: 'form'
        }
      },
      { $unwind: '$form' },
      // Fix: unwind targetLevels array correctly
      { $unwind: { path: '$form.targetLevels', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          formId: 1,
          targetLevel: '$form.targetLevels'
        }
      }
    ]);

    console.log('countsByLevel aggregation result:', countsByLevel);

    console.log('Counts by Level aggregation result:', countsByLevel);

    // Group after projection
    const groupedCountsByLevel = countsByLevel.reduce((acc, item) => {
      if (item.targetLevel) {
        acc[item.targetLevel] = (acc[item.targetLevel] || 0) + 1;
      }
      return acc;
    }, {});

    console.log('Grouped counts by level:', groupedCountsByLevel);

    // Convert groupedCountsByLevel object to array for frontend
    const countsByLevelArray = Object.entries(groupedCountsByLevel).map(([key, count]) => ({
      _id: key,
      count,
    }));

    const countsByDepartment = await Response.aggregate([
      { $match: responseFilter },
      {
        $lookup: {
          from: 'forms',
          localField: 'formId',
          foreignField: '_id',
          as: 'form'
        }
      },
      { $unwind: '$form' },
      { $unwind: { path: '$form.targetDepartments', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$form.targetDepartments',
          count: { $sum: 1 }
        }
      }
    ]);

    const countsByDesignation = await Response.aggregate([
      { $match: responseFilter },
      {
        $lookup: {
          from: 'forms',
          localField: 'formId',
          foreignField: '_id',
          as: 'form'
        }
      },
      { $unwind: '$form' },
      { $unwind: '$form.targetDesignations' },
      {
        $group: {
          _id: '$form.targetDesignations',
          count: { $sum: 1 }
        }
      }
    ]);

    const enrichedResponses = responses.map(r => ({
      ...r,
      formTitle: formMap[r.formId.toString()] || 'Unknown',
      employeeName: userMap[r.respondentEmail] || 'Anonymous'
    }));

    console.log('Sending countsByLevel array:', countsByLevelArray);

    res.json({
      responses: enrichedResponses,
      countsByLevel: countsByLevelArray,
      countsByDepartment,
      countsByDesignation
    });
  } catch (error) {
    console.error('Fetch Responses Error:', error);
    res.status(500).json({ message: 'Failed to fetch responses' });
  }
});

// Submit response
router.post('/', async (req, res) => {
  try {
    const { formId, answers, respondentEmail, startTime } = req.body;

    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ message: 'Form not found' });
    if (!form.isPublished) return res.status(403).json({ message: 'Form is not accepting responses' });

    if (form.settings?.limitOneResponse && respondentEmail) {
      const exists = await Response.findOne({ formId, respondentEmail });
      if (exists) return res.status(400).json({ message: 'Already submitted' });
    }

    const response = new Response({
      formId: formId, // ensure saved as formId
      answers: answers.map((ans, i) => ({
        questionId: ans.questionId || `q${i}`,
        type: ans.type,
        value: ans.value,
        timestamp: ans.timestamp || new Date()
      })),
      respondentEmail,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      startTime,
      endTime: new Date()
    });

    await response.save();
    res.status(201).json(response);
  } catch (error) {
    console.error('Submit Error:', error);
    res.status(400).json({ message: 'Failed to submit response' });
  }
});

// Get single response
router.get('/:id', async (req, res) => {
  try {
    const response = await Response.findById(req.params.id).lean();
    if (!response) return res.status(404).json({ message: 'Response not found' });

    const form = await Form.findById(response.formId).lean();
    const user = response.respondentEmail ? await User.findOne({ email: response.respondentEmail }).lean() : null;

    const questionMap = {};
    if (form?.questions) {
      form.questions.forEach(q => {
        questionMap[q._id?.toString()] = q.title || q.label || q.text || 'Question';
      });
    }

    const enrichedAnswers = response.answers.map(ans => ({
      ...ans,
      questionText: questionMap[ans.questionId] || 'Unknown Question'
    }));

    res.json({
      ...response,
      formTitle: form?.title || 'Unknown',
      employeeName: user?.username || 'Anonymous',
      answers: enrichedAnswers
    });
  } catch (error) {
    console.error('Get Response Error:', error);
    res.status(500).json({ message: 'Failed to fetch response' });
  }
});

// Delete response
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Response.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Response not found' });

    res.json({ message: 'Response deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ message: 'Failed to delete response' });
  }
});

module.exports = router;

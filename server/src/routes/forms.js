const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const EmployeeProfile = require('../models/EmployeeProfile');
const { verifyToken } = require('../middleware/auth');

// Create new form
router.post('/', async (req, res) => {
  try {
    const formData = req.body;
    console.log('Received formData:', formData);

    if (!formData.title || !formData.createdBy) {
      return res.status(400).json({ message: 'Title and creator ID are required' });
    }

    // Save full arrays for targeting fields
    formData.targetLevels = formData.targetLevels || [];
    formData.targetDepartments = formData.targetDepartments || [];
    formData.targetDesignations = formData.targetDesignations || [];

    const form = new Form(formData);
    const savedForm = await form.save();
    res.status(201).json(savedForm);
  } catch (err) {
    console.error('Error saving form:', err);
    res.status(400).json({ message: 'Failed to save form', error: err.message });
  }
});

// Get all forms
router.get('/', verifyToken, async (req, res) => {
  try {
    // Temporarily disable level-based filtering to restore access
    const forms = await Form.find();
    console.log('Returning all forms without level filtering, count:', forms.length);
    const mapped = forms.map(form => ({
      ...form.toObject(),
      designation: form.targetDesignations?.[0] || null,
      department: form.targetDepartments?.[0] || null,
      level: form.targetLevels?.[0] || null,
      isPublished: form.isPublished,
    }));
    return res.json(mapped);
  } catch (err) {
    console.error('Error fetching forms:', err);
    res.status(500).json({ message: 'Failed to fetch forms' });
  }
});

const levelMap = {
  'strategic': 'l001',
  'tactical': 'l002',
  'operational': 'l003',
};

router.get('/:id', verifyToken, async (req, res) => {
  try {
    console.log('Decoded user from token:', req.user);
    const userEmail = req.user.email;
    const employeeProfile = await EmployeeProfile.findOne({ email: userEmail });
    console.log('Fetched employee profile:', employeeProfile);
    let userLevelRaw = '';
    if (!employeeProfile) {
      // Check if user is admin in User model
      const User = require('../models/User');
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return res.status(403).json({ message: 'User profile not found' });
      }
      if (user.role === 'admin') {
        // Admin user, allow access without level restriction
        userLevelRaw = 'admin';
      } else {
        return res.status(403).json({ message: 'Employee profile not found' });
      }
    } else {
      userLevelRaw = employeeProfile.level ? employeeProfile.level.toLowerCase() : '';
    }
    const userLevel = levelMap[userLevelRaw] || userLevelRaw;
    console.log('Mapped user level:', userLevel);

    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ message: 'Form not found' });

    console.log('Form targetLevels:', form.targetLevels);

    if (!userLevel) {
      return res.status(403).json({ message: 'User level undefined, access forbidden' });
    }

    if (!form.targetLevels || form.targetLevels.length === 0) {
      // If no targetLevels specified, allow access
      return res.json(form);
    }

    const normalizedTargetLevels = form.targetLevels.map(level => level.toLowerCase());

    // Level-based filtering is disabled to allow access for all users
    if (userLevel !== 'admin') {
      if (!normalizedTargetLevels.includes(userLevel)) {
        return res.status(403).json({ message: 'Access forbidden: your level is not authorized to view this form' });
      }
    }

    console.log('Returning form data:', form);
    res.json(form);
  } catch (err) {
    console.error('Error fetching form by ID:', err);
    res.status(500).json({ message: 'Failed to fetch form' });
  }
});

// Publish/unpublish form
router.patch('/:id/publish', async (req, res) => {
  try {
    console.log('Publish API called with body:', req.body);
    const { isPublished } = req.body;
    // Validate isPublished is boolean
    if (typeof isPublished !== 'boolean') {
      return res.status(400).json({ message: 'isPublished must be a boolean' });
    }
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ message: 'Form not found' });
    console.log('Before update publish status:', form.isPublished);
    form.isPublished = isPublished;
    await form.save();
    console.log('After update publish status:', form.isPublished);
    res.json(form);
  } catch (err) {
    console.error('Publish error:', err);
    res.status(500).json({ message: 'Failed to update publish status' });
  }
});

// Delete form by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedForm = await Form.findByIdAndDelete(req.params.id);
    if (!deletedForm) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.json({ message: 'Form deleted successfully' });
  } catch (err) {
    console.error('Error deleting form:', err);
    res.status(500).json({ message: 'Failed to delete form' });
  }
});

// Update form
router.put('/:id', async (req, res) => {
  try {
    const updateData = req.body;

    if (!updateData.title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Save full arrays for targeting fields
    updateData.targetLevels = updateData.targetLevels || [];
    updateData.targetDepartments = updateData.targetDepartments || [];
    updateData.targetDesignations = updateData.targetDesignations || [];

    const updatedForm = await Form.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedForm) return res.status(404).json({ message: 'Form not found' });
    res.json(updatedForm);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Failed to update form' });
  }
});

// Count by level
router.get('/countByLevel', async (req, res) => {
  try {
    const counts = await Form.aggregate([
      { $unwind: '$targetLevels' },
      { $group: { _id: '$targetLevels', count: { $sum: 1 } } }
    ]);
    res.json(counts);
  } catch (err) {
    console.error('Count by level error:', err);
    res.status(500).json({ message: 'Failed to count by level' });
  }
});

// Count by department
router.get('/countByDepartment', async (req, res) => {
  try {
    const counts = await Form.aggregate([
      { $unwind: '$targetDepartments' },
      { $group: { _id: '$targetDepartments', count: { $sum: 1 } } }
    ]);
    res.json(counts);
  } catch (err) {
    console.error('Count by department error:', err);
    res.status(500).json({ message: 'Failed to count by department' });
  }
});

// Count by designation
router.get('/countByDesignation', async (req, res) => {
  try {
    const counts = await Form.aggregate([
      { $unwind: '$targetDesignations' },
      { $group: { _id: '$targetDesignations', count: { $sum: 1 } } }
    ]);
    res.json(counts);
  } catch (err) {
    console.error('Count by designation error:', err);
    res.status(500).json({ message: 'Failed to count by designation' });
  }
});

router.get('/employee/targeted-forms', verifyToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const employeeProfile = await EmployeeProfile.findOne({ email: userEmail });
    if (!employeeProfile) {
      return res.status(403).json({ message: 'Employee profile not found' });
    }

    const userLevel = employeeProfile.level ? employeeProfile.level.toLowerCase() : '';
    const userDepartment = employeeProfile.department ? employeeProfile.department.toLowerCase() : '';
    const userDesignation = employeeProfile.designation ? employeeProfile.designation.toLowerCase() : '';

    // Build query to match any of the target arrays
    const query = {
      isPublished: true,
      $or: [
        { targetLevels: { $in: [userLevel] } },
        { targetDepartments: { $in: [userDepartment] } },
        { targetDesignations: { $in: [userDesignation] } },
      ],
    };

    const targetedForms = await Form.find(query);
    res.json(targetedForms);
  } catch (err) {
    console.error('Error fetching targeted forms:', err);
    res.status(500).json({ message: 'Failed to fetch targeted forms' });
  }
});

module.exports = router;

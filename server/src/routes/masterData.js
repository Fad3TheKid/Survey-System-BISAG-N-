const express = require('express');
const router = express.Router();

const Master = require('../models/Master');


// Add new department
router.post('/departments', async (req, res) => {
  try {
    const { dept_id, name, levelCategory } = req.body;
    if (!dept_id || !name || !levelCategory) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const master = await Master.findOne({});
    if (!master) {
      return res.status(404).json({ message: 'Master data not found' });
    }
    // Check if department with same dept_id exists
    if (master.departments.some(d => d.dept_id === dept_id)) {
      return res.status(400).json({ message: 'Department with this ID already exists' });
    }
    master.departments.push({ dept_id, name, levelCategory });
    await master.save();
    res.status(201).json({ message: 'Department added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding department' });
  }
});

// Delete department
router.delete('/departments/:dept_id', async (req, res) => {
  try {
    const { dept_id } = req.params;
    const master = await Master.findOne({});
    if (!master) {
      return res.status(404).json({ message: 'Master data not found' });
    }
    const initialLength = master.departments.length;
    master.departments = master.departments.filter(d => d.dept_id !== dept_id);
    if (master.departments.length === initialLength) {
      return res.status(404).json({ message: 'Department not found' });
    }
    await master.save();
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting department' });
  }
});

// Add new level
router.post('/levels', async (req, res) => {
  try {
    const { level_id, name } = req.body;
    if (!level_id || !name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const master = await Master.findOne({});
    if (!master) {
      return res.status(404).json({ message: 'Master data not found' });
    }
    if (master.levels.some(l => l.level_id === level_id)) {
      return res.status(400).json({ message: 'Level with this ID already exists' });
    }
    master.levels.push({ level_id, name });
    await master.save();
    res.status(201).json({ message: 'Level added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding level' });
  }
});

// Delete level
router.delete('/levels/:level_id', async (req, res) => {
  try {
    const { level_id } = req.params;
    const master = await Master.findOne({});
    if (!master) {
      return res.status(404).json({ message: 'Master data not found' });
    }
    const initialLength = master.levels.length;
    master.levels = master.levels.filter(l => l.level_id !== level_id);
    if (master.levels.length === initialLength) {
      return res.status(404).json({ message: 'Level not found' });
    }
    await master.save();
    res.json({ message: 'Level deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting level' });
  }
});

  // Add new designation
  router.post('/designations', async (req, res) => {
    try {
      const { desig_id, name, dept_id, level_id } = req.body;
      if (!desig_id || !name || !dept_id || !level_id) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      const master = await Master.findOne({});
      if (!master) {
        return res.status(404).json({ message: 'Master data not found' });
      }
      if (master.designations.some(d => d.desig_id === desig_id)) {
        return res.status(400).json({ message: 'Designation with this ID already exists' });
      }
      master.designations.push({ desig_id, name, dept_id, level_id });
      await master.save();
      res.status(201).json({ message: 'Designation added successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error adding designation' });
    }
  });

// Delete designation
router.delete('/designations/:desig_id', async (req, res) => {
  try {
    const { desig_id } = req.params;
    const master = await Master.findOne({});
    if (!master) {
      return res.status(404).json({ message: 'Master data not found' });
    }
    const initialLength = master.designations.length;
    master.designations = master.designations.filter(d => d.desig_id !== desig_id);
    if (master.designations.length === initialLength) {
      return res.status(404).json({ message: 'Designation not found' });
    }
    await master.save();
    res.json({ message: 'Designation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting designation' });
  }
});

  // Get all departments
  router.get('/departments', async (req, res) => {
    try {
      const master = await Master.findOne({});
      if (!master) {
        return res.status(404).json({ message: 'Master data not found' });
      }
      res.json(master.departments);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching departments' });
    }
  });

// Get all levels
router.get('/levels', async (req, res) => {
  try {
    const master = await Master.findOne({});
    if (!master) {
      return res.status(404).json({ message: 'Master data not found' });
    }
    res.json(master.levels);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching levels' });
  }
});

router.get('/levels/:dept_id', async (req, res) => {
  try {
    const { dept_id } = req.params;
    const master = await Master.findOne({});
    if (!master) {
      return res.status(404).json({ message: 'Master data not found' });
    }
    const department = master.departments.find(d => d.dept_id === dept_id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    // Find levels matching the department's levelCategory
    const levels = master.levels.filter(l => l.name === department.levelCategory);
    res.json(levels);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching levels' });
  }
});

  // Get all designations or filter by department
  router.get('/designations', async (req, res) => {
    try {
      const { department } = req.query;
      const master = await Master.findOne({});
      if (!master) {
        return res.status(404).json({ message: 'Master data not found' });
      }
      let designations = master.designations;
      if (department) {
        designations = designations.filter(d => d.dept_id === department);
      }
      // Map level_id to level object and convert to plain object
      designations = designations.map(desig => {
        const level = master.levels.find(l => l.level_id === desig.level_id);
        return { ...desig.toObject(), level };
      });
      console.log('Designations sent:', designations);
      res.json(designations);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching designations' });
    }
  });

module.exports = router;

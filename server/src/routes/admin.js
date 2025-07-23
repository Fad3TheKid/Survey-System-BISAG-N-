const express = require('express');
const router = express.Router();
const Form = require('../models/Form');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// Get formId by form title
router.get('/formIdByTitle', verifyToken, authorizeRoles('admin'), async (req, res) => {
  const { title } = req.query;
  if (!title) {
    return res.status(400).json({ message: 'Form title is required' });
  }
  try {
    const form = await Form.findOne({ title: title.trim() });
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.json({ formId: form._id });
  } catch (error) {
    console.error('Error fetching form by title:', error);
    res.status(500).json({ message: 'Failed to fetch form' });
  }
});

// Admin dashboard route
router.get('/dashboard', verifyToken, authorizeRoles('admin'), (req, res) => {
  res.json({ message: 'Welcome to the Admin Dashboard' });
});

module.exports = router;

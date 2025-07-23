const mongoose = require('mongoose');

const employeeProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    // Removed unique constraint to avoid duplicate key error on null userId
    // unique: true,
  },
  email: {
    type: String,
    trim: true,
  },
  employeeId: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  employeeName: {
    type: String,
    required: true,
    trim: true,
  },
  dateOfJoining: {
    type: Date,
  },
  department: {
    type: String,
  },
  level: {
    type: String,
  },
  designation: {
    type: String,
  },
  reportingAuthorityName: {
    type: String,
  },
  reportingAuthorityDepartment: {
    type: String,
  },
  reportingAuthorityLevel: {
    type: String,
  },
  reportingAuthorityDesignation: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('EmployeeProfile', employeeProfileSchema);

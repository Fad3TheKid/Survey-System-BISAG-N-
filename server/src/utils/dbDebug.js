const mongoose = require('mongoose');
const EmployeeProfile = require('../models/EmployeeProfile');
const Form = require('../models/Form');

async function debugData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/formsdb');
    console.log('Connected to MongoDB');

    // Fetch all employee profiles
    const employees = await EmployeeProfile.find({});
    console.log('Employee Profiles:');
    employees.forEach(emp => {
      console.log(`ID: ${emp._id}, Department: ${emp.department}, Designation: ${emp.designation}, Level: ${emp.level}`);
    });

    // Fetch all forms with target fields
    const forms = await Form.find({});
    console.log('Forms with target fields:');
    forms.forEach(form => {
      console.log(`ID: ${form._id}, Title: ${form.title}`);
      console.log(`  targetDepartments: ${JSON.stringify(form.targetDepartments)}`);
      console.log(`  targetDesignations: ${JSON.stringify(form.targetDesignations)}`);
      console.log(`  targetLevels: ${JSON.stringify(form.targetLevels)}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error during DB debug:', error);
    process.exit(1);
  }
}

debugData();

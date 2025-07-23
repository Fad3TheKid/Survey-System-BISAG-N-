const mongoose = require('mongoose');
const Form = require('./Form'); // fixed path to Form model

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/formsdb';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected');

    // Remove all old forms
    await Form.deleteMany({});

    const sampleForm = new Form({
      title: 'Customer Satisfaction Survey',
      description: 'Please fill out this survey to help us improve our services.',
      createdBy: 'admin-user-123',
      isPublished: true,
      questions: [
        {
          type: 'multiple',
          title: 'How satisfied are you with our service?',
          required: true,
          options: [
            { text: 'Very satisfied', value: 'very_satisfied' },
            { text: 'Satisfied', value: 'satisfied' },
            { text: 'Neutral', value: 'neutral' },
            { text: 'Dissatisfied', value: 'dissatisfied' },
            { text: 'Very dissatisfied', value: 'very_dissatisfied' },
          ],
          settings: {
            shuffleOptions: false,
          },
        },
        {
          type: 'paragraph',
          title: 'Please provide additional comments',
          required: false,
        },
        {
          type: 'linear',
          title: 'Rate the quality of our products',
          required: true,
          settings: {
            linearScale: {
              min: 1,
              max: 10,
              minLabel: 'Poor',
              maxLabel: 'Excellent',
            },
          },
        },
      ],
    });

    const employeeRegistrationForm = new Form({
      title: 'Employee Registration Form',
      description: 'Form to register new employees.',
      createdBy: 'admin-user-123',
      isPublished: true,
      questions: [
        {
          type: 'short',
          title: 'Employee Name',
          required: true,
        },
        {
          type: 'email',
          title: 'Employee Email',
          required: true,
        },
        {
          type: 'dropdown',
          title: 'Department',
          required: true,
          options: [
            { text: 'HR', value: 'hr' },
            { text: 'Engineering', value: 'engineering' },
            { text: 'Sales', value: 'sales' },
            { text: 'Marketing', value: 'marketing' },
          ],
        },
        {
          type: 'dropdown',
          title: 'Designation',
          required: true,
          options: [
            { text: 'Manager', value: 'manager' },
            { text: 'Senior Developer', value: 'senior_developer' },
            { text: 'Junior Developer', value: 'junior_developer' },
            { text: 'Intern', value: 'intern' },
          ],
        },
      ],
    });

    await sampleForm.save();
    await employeeRegistrationForm.save();

    console.log('Sample forms created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();

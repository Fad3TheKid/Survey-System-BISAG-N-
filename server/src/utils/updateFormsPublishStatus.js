const mongoose = require('mongoose');
const Form = require('../models/Form');

const mongoUri = 'mongodb://localhost:27017/formsdb'; // Update with your MongoDB URI if different

async function updateFormsPublishStatus() {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const result = await Form.updateMany(
      { isPublished: { $ne: true } },
      { $set: { isPublished: true } }
    );

    console.log(`Matched ${result.matchedCount} documents.`);
    console.log(`Modified ${result.modifiedCount} documents.`);

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error updating forms publish status:', error);
  }
}

updateFormsPublishStatus();

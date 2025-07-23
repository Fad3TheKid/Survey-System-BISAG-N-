const mongoose = require('mongoose');

// Schema for an individual answer inside a response
const answerSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Main schema for a response to a form
const responseSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
    respondentEmail: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Export the model
module.exports = mongoose.model('Response', responseSchema);

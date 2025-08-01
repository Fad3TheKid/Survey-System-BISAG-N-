const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.error('Stack trace:', error.stack); // Log the stack trace for more details
    process.exit(1);
  }
};

module.exports = connectDB;

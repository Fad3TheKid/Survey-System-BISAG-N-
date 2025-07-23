const mongoose = require('mongoose');

const MasterSchema = new mongoose.Schema({
  departments: [
    {
      dept_id: String,
      name: String,
      levelCategory: String,
    },
  ],
  levels: [
    {
      level_id: String,
      name: String,
    },
  ],
  designations: [
    {
      desig_id: String,
      name: String,
      dept_id: String,  // Reference to department id
      level_id: String, // Reference to level id
    },
  ],
});

module.exports = mongoose.model('Master', MasterSchema);

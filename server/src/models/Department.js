const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  dept_id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  levelCategory: { type: String, required: true }, // Strategic, Tactical, Operational
});

module.exports = mongoose.model('Department', DepartmentSchema);

const mongoose = require('mongoose');

const DesignationSchema = new mongoose.Schema({
  desig_id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  level: { type: mongoose.Schema.Types.ObjectId, ref: 'Level', required: true },
});

module.exports = mongoose.model('Designation', DesignationSchema);

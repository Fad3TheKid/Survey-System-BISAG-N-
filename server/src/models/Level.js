const mongoose = require('mongoose');

const LevelSchema = new mongoose.Schema({
  level_id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
});

module.exports = mongoose.model('Level', LevelSchema);

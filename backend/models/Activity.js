const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
module.exports = mongoose.model('Activity', new mongoose.Schema({
  project: { type: ObjectId, ref: 'Project', required: true, index: true },
  user: { type: ObjectId, ref: 'User' },
  message: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } }));

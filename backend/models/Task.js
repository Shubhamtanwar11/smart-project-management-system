const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
module.exports = mongoose.model('Task', new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  project: { type: ObjectId, ref: 'Project', required: true, index: true },
  assignedTo: { type: ObjectId, ref: 'User' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['todo', 'in-progress', 'completed'], default: 'todo' },
  dueDate: Date,
}, { timestamps: true }));

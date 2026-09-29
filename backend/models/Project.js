const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
module.exports = mongoose.model('Project', new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  owner: { type: ObjectId, ref: 'User', required: true },
  members: [{ type: ObjectId, ref: 'User' }],
  deadline: Date,
  status: { type: String, enum: ['active', 'completed', 'on-hold'], default: 'active' },
}, { timestamps: { createdAt: true, updatedAt: false } }));

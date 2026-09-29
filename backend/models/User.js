const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  avatar: { type: String, default: '' },
}, { timestamps: { createdAt: true, updatedAt: false } });
schema.pre('save', async function (next) {
  if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 10);
  next();
});
schema.methods.matchPassword = function (plain) { return bcrypt.compare(plain, this.password); };
module.exports = mongoose.model('User', schema);

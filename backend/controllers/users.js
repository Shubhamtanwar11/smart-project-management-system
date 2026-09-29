const User = require('../models/User');
const wrap = require('../utils/wrap');
const fail = require('../utils/fail');
exports.getProfile = (req, res) => res.json({ success: true, user: req.user });
exports.updateProfile = wrap(async (req, res) => {
  const { name, avatar, currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (name !== undefined) { if (!name.trim()) return fail(res, 400, 'Name cannot be empty'); user.name = name; }
  if (avatar !== undefined) user.avatar = avatar;
  if (newPassword) {
    if (!currentPassword || !(await user.matchPassword(currentPassword))) return fail(res, 400, 'Current password is incorrect');
    if (newPassword.length < 6) return fail(res, 400, 'New password must be at least 6 characters');
    user.password = newPassword;
  }
  await user.save();
  res.json({ success: true, user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar } });
});

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const wrap = require('../utils/wrap');
const fail = require('../utils/fail');
const send = (res, code, user) => res.status(code).json({
  success: true,
  token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' }),
  user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar },
});
exports.register = wrap(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return fail(res, 400, 'Name, email and password are required');
  if (password.length < 6) return fail(res, 400, 'Password must be at least 6 characters');
  if (await User.findOne({ email: email.toLowerCase() })) return fail(res, 400, 'Email already registered');
  send(res, 201, await User.create({ name, email, password }));
});
exports.login = wrap(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return fail(res, 400, 'Email and password are required');
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) return fail(res, 401, 'Invalid email or password');
  send(res, 200, user);
});
exports.me = (req, res) => res.json({ success: true, user: req.user });

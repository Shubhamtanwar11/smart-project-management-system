const jwt = require('jsonwebtoken');
const User = require('../models/User');
const wrap = require('../utils/wrap');
const fail = require('../utils/fail');
module.exports = wrap(async (req, res, next) => {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return fail(res, 401, 'Not authorized');
  try {
    const { id } = jwt.verify(h.slice(7), process.env.JWT_SECRET);
    req.user = await User.findById(id);
  } catch { return fail(res, 401, 'Invalid or expired token'); }
  if (!req.user) return fail(res, 401, 'User no longer exists');
  next();
});

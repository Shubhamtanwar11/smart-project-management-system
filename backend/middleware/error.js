exports.notFound = (req, res) => res.status(404).json({ success: false, message: 'Route not found' });
exports.errorHandler = (err, req, res, next) => {
  let code = 500, message = 'Server error';
  if (err.name === 'ValidationError') { code = 400; message = Object.values(err.errors).map((e) => e.message).join(', '); }
  else if (err.code === 11000) { code = 400; message = 'Email already registered'; }
  else if (err.name === 'CastError') { code = 404; message = 'Resource not found'; }
  if (code === 500) console.error(err);
  res.status(code).json({ success: false, message });
};

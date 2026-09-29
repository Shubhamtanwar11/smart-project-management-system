module.exports = (res, code, message) => res.status(code).json({ success: false, message });

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Admin check (runs AFTER protect middleware)
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false,
      message: 'Admin access required' 
    });
  }
};

module.exports = { admin };
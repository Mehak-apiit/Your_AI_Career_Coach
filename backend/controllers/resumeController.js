const User = require('../models/User');
const path = require('path');

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const resumeUrl = `/uploads/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { resumeUrl },
      { new: true }
    );

    res.json({ 
      message: 'Resume uploaded successfully',
      resumeUrl: req.protocol + '://' + req.get('host') + resumeUrl 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadResume };
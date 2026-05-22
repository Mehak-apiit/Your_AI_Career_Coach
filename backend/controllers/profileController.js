const User = require('../models/User');  // ✅ CORRECT PATH

// Get user profile
const getProfile = async (req, res) => {
  try {
    console.log('User ID:', req.user.id);  // Debug log
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        ...updates, 
        profileCompleted: true 
      },
      { 
        new: true,
        runValidators: true 
      }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateProfile };
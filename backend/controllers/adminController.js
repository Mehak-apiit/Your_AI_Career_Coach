const User = require('../models/User');

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get analytics (Admin dashboard)
const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ profileCompleted: true });
    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
    });

    res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        activeUsers,
        completionRate: Math.round((activeUsers / totalUsers) * 100) || 0,
        recentUsers,
        lastMonthSignups: recentUsers
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = { getAllUsers, deleteUser, getAnalytics };
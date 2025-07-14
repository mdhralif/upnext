const express = require('express');
const auth = require('../middleware/auth');
const prisma = require('../config/database');

const router = express.Router();

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { tasks: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user stats
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await prisma.task.groupBy({
      by: ['status'],
      where: { userId: req.user.id },
      _count: { status: true }
    });

    const totalTasks = await prisma.task.count({
      where: { userId: req.user.id }
    });

    const completedTasks = await prisma.task.count({
      where: { userId: req.user.id, completed: true }
    });

    const overdueTasks = await prisma.task.count({
      where: {
        userId: req.user.id,
        completed: false,
        dueDate: { lt: new Date() }
      }
    });

    res.json({
      success: true,
      message: 'Stats retrieved successfully',
      data: {
        totalTasks,
        completedTasks,
        overdueTasks,
        statusBreakdown: stats,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;

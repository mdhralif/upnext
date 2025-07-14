const express = require('express');
const { body, validationResult, query } = require('express-validator');
const auth = require('../middleware/auth');
const prisma = require('../config/database');

const router = express.Router();

// Validation middleware
const validateTask = [
  body('title').notEmpty().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('dueDate').optional().isISO8601(),
];

const validateTaskUpdate = [
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  body('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  body('dueDate').optional().isISO8601(),
  body('completed').optional().isBoolean(),
];

// Get all tasks for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, completed, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const where = { userId: req.user.id };
    
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (completed !== undefined) where.completed = completed === 'true';
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const orderBy = {};
    // Default to createdAt if sortOrder field doesn't exist
    orderBy[sortBy === 'sortOrder' ? 'createdAt' : sortBy] = sortOrder === 'asc' && sortBy === 'sortOrder' ? 'desc' : sortOrder;

    const tasks = await prisma.task.findMany({
      where,
      orderBy,
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      }
    }).catch(async (error) => {
      // If sortOrder field doesn't exist, fallback to createdAt ordering
      if (error.message.includes('sortOrder')) {
        console.log('sortOrder field not found, falling back to createdAt ordering');
        return await prisma.task.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, username: true, email: true }
            }
          }
        });
      }
      throw error;
    });

    res.json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Reorder tasks (must be before /:id routes)
router.patch('/reorder', auth, async (req, res) => {
  try {
    const { taskOrders } = req.body; // Array of { id, sortOrder }
    
    if (!Array.isArray(taskOrders)) {
      return res.status(400).json({
        success: false,
        message: 'taskOrders must be an array'
      });
    }

    // Update all tasks with new sort orders
    const updatePromises = taskOrders.map(({ id, sortOrder }) =>
      prisma.task.updateMany({
        where: {
          id,
          userId: req.user.id
        },
        data: {
          sortOrder
        }
      }).catch(error => {
        // If sortOrder field doesn't exist, skip this update
        if (error.message.includes('sortOrder')) {
          console.log(`Skipping sortOrder update for task ${id} - field doesn't exist yet`);
          return { count: 0 };
        }
        throw error;
      })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Tasks reordered successfully'
    });
  } catch (error) {
    console.error('Reorder tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single task
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      }
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task retrieved successfully',
      data: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create task
router.post('/', auth, validateTask, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { title, description, status = 'PENDING', priority = 'MEDIUM', dueDate } = req.body;

    // Get the count of existing tasks to set sortOrder
    const taskCount = await prisma.task.count({
      where: { userId: req.user.id }
    });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        sortOrder: taskCount,
        userId: req.user.id
      },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      }
    }).catch(async (error) => {
      // If sortOrder field doesn't exist yet, create without it
      if (error.code === 'P2002' || error.message.includes('sortOrder')) {
        return await prisma.task.create({
          data: {
            title,
            description,
            status,
            priority,
            dueDate: dueDate ? new Date(dueDate) : null,
            userId: req.user.id
          },
          include: {
            user: {
              select: { id: true, username: true, email: true }
            }
          }
        });
      }
      throw error;
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update task
router.put('/:id', auth, validateTaskUpdate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { title, description, status, priority, dueDate, completed } = req.body;

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (completed !== undefined) {
      updateData.completed = completed;
      if (completed) {
        updateData.completedAt = new Date();
        updateData.status = 'COMPLETED';
      } else {
        updateData.completedAt = null;
        updateData.status = 'PENDING';
      }
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await prisma.task.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Toggle task completion
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const existingTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const newCompleted = !existingTask.completed;
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        completed: newCompleted,
        completedAt: newCompleted ? new Date() : null,
        status: newCompleted ? 'COMPLETED' : 'PENDING'
      },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Task status toggled successfully',
      data: task
    });
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;

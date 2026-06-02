const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Task = require('../models/Task');

const router = express.Router();

// Get all tasks for user — NO param needed
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create task — NO param needed
router.post(
  '/',
  auth,
  [
    body('text').trim().notEmpty().withMessage('Text is required').isLength({ max: 120 }),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('category').optional().isIn(['Personal', 'Work', 'Health', 'Shopping', 'Finance', 'Other']),
    body('repeat').optional().isIn(['none', 'daily', 'weekly', 'monthly']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const task = new Task({ ...req.body, user: req.user._id });
      await task.save();
      res.status(201).json(task);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    let task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle task completion — must be BEFORE delete /:id
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.done = !task.done;
    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete single task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete ALL tasks for user
router.delete('/', auth, async (req, res) => {
  try {
    await Task.deleteMany({ user: req.user._id });
    res.json({ message: 'All tasks deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
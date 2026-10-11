const express = require('express');
const { getDB } = require('../database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/me - Current user profile
router.get('/me', authenticate, (req, res) => {
  try {
    const db = getDB();
    const user = db.prepare('SELECT id, name, email, role, employee_id, department, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

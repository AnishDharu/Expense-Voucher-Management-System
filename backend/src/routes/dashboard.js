const express = require('express');
const { getDB } = require('../database');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/dashboard/employee
router.get('/employee', authenticate, authorize('employee'), (req, res) => {
  try {
    const db = getDB();
    const userId = req.user.id;

    const stats = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        COALESCE(SUM(amount), 0) as total_amount_claimed,
        COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) as total_approved_amount
      FROM vouchers WHERE employee_id = ?
    `).get(userId);

    const recentVouchers = db.prepare(`
      SELECT id, voucher_number, expense_title, amount, status, expense_date, created_at
      FROM vouchers WHERE employee_id = ?
      ORDER BY created_at DESC LIMIT 5
    `).all(userId);

    res.json({ success: true, data: { stats, recentVouchers } });
  } catch (err) {
    console.error('Employee dashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/dashboard/director
router.get('/director', authenticate, authorize('director'), (req, res) => {
  try {
    const db = getDB();
    const today = new Date().toISOString().split('T')[0];

    const stats = db.prepare(`
      SELECT
        SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as pending_approval,
        SUM(CASE WHEN status = 'approved' AND approval_date = ? THEN 1 ELSE 0 END) as approved_today,
        SUM(CASE WHEN status = 'rejected' AND DATE(updated_at) = ? THEN 1 ELSE 0 END) as rejected_today,
        COALESCE(SUM(CASE WHEN status = 'submitted' THEN amount ELSE 0 END), 0) as total_pending_amount,
        COUNT(*) as total_vouchers
      FROM vouchers
    `).get(today, today);

    const recentActivity = db.prepare(`
      SELECT id, voucher_number, employee_name, department, expense_title, amount, status, updated_at
      FROM vouchers
      ORDER BY updated_at DESC LIMIT 10
    `).all();

    const pendingVouchers = db.prepare(`
      SELECT id, voucher_number, employee_name, department, expense_title, amount, expense_date, created_at
      FROM vouchers WHERE status = 'submitted'
      ORDER BY created_at ASC LIMIT 5
    `).all();

    res.json({ success: true, data: { stats, recentActivity, pendingVouchers } });
  } catch (err) {
    console.error('Director dashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/dashboard/accounts
router.get('/accounts', authenticate, authorize('accounts'), (req, res) => {
  try {
    const db = getDB();

    const stats = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as pending_approval,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) as total_approved_amount
      FROM vouchers
    `).get();

    const recentApproved = db.prepare(`
      SELECT id, voucher_number, employee_name, department, expense_title, amount, approval_date
      FROM vouchers WHERE status = 'approved'
      ORDER BY approval_date DESC LIMIT 10
    `).all();

    res.json({ success: true, data: { stats, recentApproved } });
  } catch (err) {
    console.error('Accounts dashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

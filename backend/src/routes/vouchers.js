const express = require('express');
const { getDB } = require('../database');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Generate voucher number
function generateVoucherNumber(db) {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const count = db.prepare("SELECT COUNT(*) as cnt FROM vouchers WHERE voucher_number LIKE ?").get(`VCH-${year}${month}-%`);
  const seq = String(count.cnt + 1).padStart(4, '0');
  return `VCH-${year}${month}-${seq}`;
}

// Build filter query helper
function buildFilterQuery(role, userId, filters) {
  let conditions = [];
  let params = [];

  // Role-based filter
  if (role === 'employee') {
    conditions.push('v.employee_id = ?');
    params.push(userId);
  }

  // Search filters
  if (filters.search) {
    conditions.push(`(v.voucher_number LIKE ? OR v.employee_name LIKE ? OR v.department LIKE ?)`);
    const s = `%${filters.search}%`;
    params.push(s, s, s);
  }
  if (filters.status) {
    conditions.push('v.status = ?');
    params.push(filters.status);
  }
  if (filters.department) {
    conditions.push('v.department LIKE ?');
    params.push(`%${filters.department}%`);
  }
  if (filters.expense_category) {
    conditions.push('v.expense_category LIKE ?');
    params.push(`%${filters.expense_category}%`);
  }
  if (filters.employee_name) {
    conditions.push('v.employee_name LIKE ?');
    params.push(`%${filters.employee_name}%`);
  }
  if (filters.date_from) {
    conditions.push('v.expense_date >= ?');
    params.push(filters.date_from);
  }
  if (filters.date_to) {
    conditions.push('v.expense_date <= ?');
    params.push(filters.date_to);
  }
  if (filters.amount_min) {
    conditions.push('v.amount >= ?');
    params.push(parseFloat(filters.amount_min));
  }
  if (filters.amount_max) {
    conditions.push('v.amount <= ?');
    params.push(parseFloat(filters.amount_max));
  }

  return { conditions, params };
}

// GET /api/vouchers - List vouchers
router.get('/', authenticate, (req, res) => {
  try {
    const db = getDB();
    const { role, id: userId } = req.user;
    const { sort_by = 'created_at', sort_dir = 'DESC', page = 1, limit = 20, ...filters } = req.query;

    const { conditions, params } = buildFilterQuery(role, userId, filters);
    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    // Validate sort fields
    const allowedSortFields = ['created_at', 'updated_at', 'voucher_number', 'expense_date', 'amount', 'status', 'employee_name', 'department'];
    const safeSortBy = allowedSortFields.includes(sort_by) ? `v.${sort_by}` : 'v.created_at';
    const safeSortDir = sort_dir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const rows = db.prepare(`
      SELECT v.*, u.email as employee_email
      FROM vouchers v
      LEFT JOIN users u ON v.employee_id = u.id
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortDir}
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), offset);

    const totalRow = db.prepare(`
      SELECT COUNT(*) as total FROM vouchers v ${whereClause}
    `).get(...params);

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: totalRow.total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalRow.total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Get vouchers error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/vouchers/:id - Get single voucher
router.get('/:id', authenticate, (req, res) => {
  try {
    const db = getDB();
    const { role, id: userId } = req.user;

    const voucher = db.prepare(`
      SELECT v.*, u.email as employee_email, d.name as director_name, d.email as director_email
      FROM vouchers v
      LEFT JOIN users u ON v.employee_id = u.id
      LEFT JOIN users d ON v.reviewed_by = d.id
      WHERE v.id = ?
    `).get(req.params.id);

    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    // Employees can only view their own vouchers
    if (role === 'employee' && voucher.employee_id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: voucher });
  } catch (err) {
    console.error('Get voucher error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/vouchers - Create voucher
router.post('/', authenticate, authorize('employee'), upload.single('employee_signature'), (req, res) => {
  try {
    const db = getDB();
    const { id: userId, name: userName, employee_id: empCode } = req.user;
    const {
      voucher_date, expense_date, department, expense_title,
      expense_category, expense_description, amount, action,
      employee_name,
    } = req.body;

    // Validation
    if (!department || !expense_title || !expense_date || !amount) {
      return res.status(400).json({ success: false, message: 'Department, expense title, expense date, and amount are required' });
    }
    if (parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });
    }

    const status = action === 'submit' ? 'submitted' : 'draft';

    // Validate signature required for submit
    if (status === 'submitted' && !req.file) {
      return res.status(400).json({ success: false, message: 'Employee signature is required before submission' });
    }

    const voucherNumber = generateVoucherNumber(db);
    const today = new Date().toISOString().split('T')[0];
    const signaturePath = req.file ? `uploads/signatures/${req.file.filename}` : null;

    const result = db.prepare(`
      INSERT INTO vouchers (
        voucher_number, voucher_date, expense_date, department,
        expense_title, expense_category, expense_description, amount,
        status, employee_id, employee_name, employee_code, employee_signature
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      voucherNumber,
      voucher_date || today,
      expense_date,
      department,
      expense_title,
      expense_category || 'Other',
      expense_description || '',
      parseFloat(amount),
      status,
      userId,
      employee_name || userName,
      empCode || '',
      signaturePath
    );

    const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ success: true, message: `Voucher ${status === 'submitted' ? 'submitted' : 'saved as draft'} successfully`, data: voucher });
  } catch (err) {
    console.error('Create voucher error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/vouchers/:id - Update voucher (employee, draft only)
router.put('/:id', authenticate, authorize('employee'), upload.single('employee_signature'), (req, res) => {
  try {
    const db = getDB();
    const { id: userId } = req.user;

    const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(req.params.id);
    if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });
    if (voucher.employee_id !== userId) return res.status(403).json({ success: false, message: 'Access denied' });
    if (voucher.status !== 'draft') return res.status(400).json({ success: false, message: 'Only draft vouchers can be edited' });

    const {
      voucher_date, expense_date, department, expense_title,
      expense_category, expense_description, amount, action, employee_name,
    } = req.body;

    if (!department || !expense_title || !expense_date || !amount) {
      return res.status(400).json({ success: false, message: 'Department, expense title, expense date, and amount are required' });
    }
    if (parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than zero' });
    }

    const status = action === 'submit' ? 'submitted' : 'draft';
    const signaturePath = req.file ? `uploads/signatures/${req.file.filename}` : voucher.employee_signature;

    if (status === 'submitted' && !signaturePath) {
      return res.status(400).json({ success: false, message: 'Employee signature is required before submission' });
    }

    // Delete old signature file if new one uploaded
    if (req.file && voucher.employee_signature) {
      const oldPath = path.join(__dirname, '..', '..', voucher.employee_signature);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    db.prepare(`
      UPDATE vouchers SET
        voucher_date = ?, expense_date = ?, department = ?, expense_title = ?,
        expense_category = ?, expense_description = ?, amount = ?, status = ?,
        employee_name = ?, employee_signature = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      voucher_date || voucher.voucher_date,
      expense_date,
      department,
      expense_title,
      expense_category || 'Other',
      expense_description || '',
      parseFloat(amount),
      status,
      employee_name || voucher.employee_name,
      signaturePath,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(req.params.id);
    res.json({ success: true, message: 'Voucher updated successfully', data: updated });
  } catch (err) {
    console.error('Update voucher error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/vouchers/:id - Delete draft voucher
router.delete('/:id', authenticate, authorize('employee'), (req, res) => {
  try {
    const db = getDB();
    const { id: userId } = req.user;

    const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(req.params.id);
    if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });
    if (voucher.employee_id !== userId) return res.status(403).json({ success: false, message: 'Access denied' });
    if (voucher.status !== 'draft') return res.status(400).json({ success: false, message: 'Only draft vouchers can be deleted' });

    // Delete signature files
    if (voucher.employee_signature) {
      const sigPath = path.join(__dirname, '..', '..', voucher.employee_signature);
      if (fs.existsSync(sigPath)) fs.unlinkSync(sigPath);
    }

    db.prepare('DELETE FROM vouchers WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Voucher deleted successfully' });
  } catch (err) {
    console.error('Delete voucher error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/vouchers/:id/approve - Director approves
router.post('/:id/approve', authenticate, authorize('director'), upload.single('director_signature'), (req, res) => {
  try {
    const db = getDB();
    const { id: directorId } = req.user;

    const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(req.params.id);
    if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });
    if (voucher.status !== 'submitted') return res.status(400).json({ success: false, message: 'Only submitted vouchers can be approved' });

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Director signature is required for approval' });
    }

    const signaturePath = `uploads/signatures/${req.file.filename}`;
    const today = new Date().toISOString().split('T')[0];

    db.prepare(`
      UPDATE vouchers SET
        status = 'approved', director_signature = ?, approval_date = ?,
        reviewed_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(signaturePath, today, directorId, req.params.id);

    const updated = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(req.params.id);
    res.json({ success: true, message: 'Voucher approved successfully', data: updated });
  } catch (err) {
    console.error('Approve voucher error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/vouchers/:id/reject - Director rejects
router.post('/:id/reject', authenticate, authorize('director'), (req, res) => {
  try {
    const db = getDB();
    const { id: directorId } = req.user;
    const { rejection_reason } = req.body;

    if (!rejection_reason || !rejection_reason.trim()) {
      return res.status(400).json({ success: false, message: 'Rejection reason is mandatory' });
    }

    const voucher = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(req.params.id);
    if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });
    if (voucher.status !== 'submitted') return res.status(400).json({ success: false, message: 'Only submitted vouchers can be rejected' });

    db.prepare(`
      UPDATE vouchers SET
        status = 'rejected', rejection_reason = ?, reviewed_by = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(rejection_reason.trim(), directorId, req.params.id);

    const updated = db.prepare('SELECT * FROM vouchers WHERE id = ?').get(req.params.id);
    res.json({ success: true, message: 'Voucher rejected', data: updated });
  } catch (err) {
    console.error('Reject voucher error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

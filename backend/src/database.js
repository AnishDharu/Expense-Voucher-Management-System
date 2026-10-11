const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', 'database.sqlite');
let db;

function getDB() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initDB() {
  const db = getDB();

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('employee', 'director', 'accounts')),
      employee_id TEXT,
      department TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Vouchers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS vouchers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      voucher_number TEXT UNIQUE NOT NULL,
      voucher_date TEXT NOT NULL,
      expense_date TEXT NOT NULL,
      department TEXT NOT NULL,
      expense_title TEXT NOT NULL,
      expense_category TEXT NOT NULL,
      expense_description TEXT,
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'submitted', 'approved', 'rejected')),
      
      -- Employee info
      employee_id INTEGER NOT NULL,
      employee_name TEXT NOT NULL,
      employee_code TEXT,
      employee_signature TEXT,
      
      -- Approval info
      director_signature TEXT,
      approval_date TEXT,
      rejection_reason TEXT,
      reviewed_by INTEGER,
      
      -- Audit
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (employee_id) REFERENCES users(id),
      FOREIGN KEY (reviewed_by) REFERENCES users(id)
    );
  `);

  // Seed default users if none exist
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    const hashedPassword = bcrypt.hashSync('password123', 10);
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password, role, employee_id, department)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertUser.run('John Employee', 'employee@abc.com', hashedPassword, 'employee', 'EMP001', 'Engineering');
    insertUser.run('Jane Employee', 'employee2@abc.com', hashedPassword, 'employee', 'EMP002', 'Marketing');
    insertUser.run('Director Smith', 'director@abc.com', hashedPassword, 'director', 'DIR001', 'Management');
    insertUser.run('Accounts Team', 'accounts@abc.com', hashedPassword, 'accounts', 'ACC001', 'Finance');

    console.log('✅ Default users seeded');
    console.log('   employee@abc.com / password123');
    console.log('   director@abc.com / password123');
    console.log('   accounts@abc.com / password123');
  }

  console.log('✅ Database initialized');
}

module.exports = { getDB, initDB };

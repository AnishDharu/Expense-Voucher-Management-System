# 💼 ExpenseFlow — Expense Voucher Management System

> A full-stack web application built for **ABC Company** to digitize the complete expense voucher creation, approval, and tracking workflow. Developed as part of the **Full Stack Developer Internship Assignment** for Prachay Securities Private Limited.

---

## 📑 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features by Role](#features-by-role)
- [Voucher Workflow](#voucher-workflow)
- [Project Setup](#project-setup)
- [Environment Variables](#environment-variables)
- [Demo Accounts](#demo-accounts)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Validation Rules](#validation-rules)
- [Assumptions](#assumptions)

---

## 🔍 Overview

ExpenseFlow replaces ABC Company's manual paper-based expense reimbursement process with a fully digital, role-aware web application. Employees can create and submit expense vouchers, the Director can approve or reject them with a digital signature, and the Accounts Team can monitor all approved vouchers for reimbursement processing.

---

## 🛠 Tech Stack

| Layer         | Technology                  | Purpose                                     |
| ------------- | --------------------------- | ------------------------------------------- |
| Frontend      | **React 18 + Vite**         | UI framework & dev server                   |
| Styling       | **Vanilla CSS**             | Custom dark-themed design system            |
| Routing       | **React Router v6**         | Client-side routing & protected routes      |
| Forms         | **react-hook-form**         | Form validation & state                     |
| HTTP          | **Axios**                   | API client with JWT interceptor             |
| Notifications | **react-hot-toast**         | Toast notifications                         |
| Icons         | **lucide-react**            | Consistent icon set                         |
| Backend       | **Node.js + Express.js**    | REST API server                             |
| Database      | **SQLite (better-sqlite3)** | Embedded, zero-config database              |
| Auth          | **JWT + bcryptjs**          | Stateless authentication & password hashing |
| File Upload   | **Multer**                  | Multipart image upload for signatures       |

---

## 🎭 Features by Role

### 👤 Employee

- ✅ Login and maintain authenticated session
- ✅ Create new expense vouchers
- ✅ Save vouchers as **Draft** (editable, deletable)
- ✅ Submit vouchers for Director approval
- ✅ Upload employee signature (image upload, drag & drop)
- ✅ Edit/Delete only **Draft** vouchers
- ✅ View only their own vouchers
- ✅ Track real-time status (Draft → Submitted → Approved/Rejected)
- ✅ View rejection reason when rejected
- ❌ Cannot view other employees' vouchers
- ❌ Cannot approve/reject vouchers
- ❌ Cannot edit submitted/approved/rejected vouchers

### 🎯 Director

- ✅ Login and view **all vouchers** across the organization
- ✅ Dedicated **Pending Approvals** queue (sorted oldest-first)
- ✅ Search, filter, and sort vouchers (7 filter dimensions)
- ✅ View full voucher details including employee signature
- ✅ **Approve** vouchers with mandatory director signature upload
- ✅ **Reject** vouchers with mandatory rejection reason
- ❌ Cannot modify any voucher details entered by employees

### 💰 Accounts Team

- ✅ Login and view **all vouchers** across the organization
- ✅ Search, filter, and sort vouchers
- ✅ View complete voucher details, all signatures, approval status
- ✅ Print/export voucher details
- ❌ Cannot create, edit, delete, approve, or reject vouchers

---

## 🔄 Voucher Workflow

```
Employee Creates
      │
      ▼
   [DRAFT] ──────────► (Edit / Delete)
      │
      │ Submit (with signature)
      ▼
 [SUBMITTED]
      │
      │ Director Reviews
      ├──────────────────────► [REJECTED] ──► Employee sees rejection reason
      │
      ▼
 [APPROVED] ──► Visible to Accounts Team for reimbursement
```

---

## 🚀 Project Setup

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd "Prachay Group"
```

### Step 2: Backend Setup

```bash
cd backend
npm install
```

Copy the example env file and configure it:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Start the backend (auto-seeds default users on first run):

```bash
npm run dev      # Development with auto-reload
# OR
npm start        # Production
```

> ✅ Backend runs on **http://localhost:5000**
> ✅ SQLite database (`database.sqlite`) is auto-created on first run
> ✅ Default demo users are seeded automatically

### Step 3: Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

> ✅ Frontend runs on **http://localhost:5173**

### Step 4: Open the App

Navigate to **http://localhost:5173** and login with any demo account below.

---

## ⚙️ Environment Variables

### `backend/.env`

| Variable         | Default               | Description                |
| ---------------- | --------------------- | -------------------------- |
| `PORT`           | `5000`                | Backend server port        |
| `JWT_SECRET`     | (set a strong secret) | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | `7d`                  | Token expiry duration      |
| `NODE_ENV`       | `development`         | Environment mode           |
| `UPLOAD_PATH`    | `uploads`             | Directory for file uploads |

---

## 👥 Demo Accounts

All accounts use password: **`password123`**

| Role       | Email               | Capabilities              |
| ---------- | ------------------- | ------------------------- |
| Employee   | `employee@abc.com`  | Create & submit vouchers  |
| Employee 2 | `employee2@abc.com` | Create & submit vouchers  |
| Director   | `director@abc.com`  | Approve, reject, view all |
| Accounts   | `accounts@abc.com`  | View all, read-only       |

---

## 📁 Project Structure

```
Prachay Group/
├── .gitignore                    ← Root gitignore
├── README.md
│
├── backend/
│   ├── .env                      ← Environment config (not committed)
│   ├── .env.example              ← Template for env setup
│   ├── .gitignore
│   ├── package.json
│   ├── database.sqlite           ← Auto-created SQLite DB (not committed)
│   ├── uploads/
│   │   └── signatures/           ← Uploaded signature images (not committed)
│   └── src/
│       ├── server.js             ← Express app entry point
│       ├── database.js           ← SQLite schema + seed data
│       ├── middleware/
│       │   ├── auth.js           ← JWT authentication & role authorization
│       │   └── upload.js         ← Multer config for image uploads
│       └── routes/
│           ├── auth.js           ← POST /api/auth/login, /register
│           ├── vouchers.js       ← Full CRUD + approve/reject
│           ├── users.js          ← GET /api/users/me
│           └── dashboard.js      ← Role-specific dashboard stats
│
└── frontend/
    ├── .gitignore
    ├── package.json
    ├── vite.config.js            ← Vite + proxy config
    ├── index.html
    └── src/
        ├── App.jsx               ← Router, protected routes
        ├── main.jsx              ← React entry point
        ├── index.css             ← Full design system (dark theme)
        ├── context/
        │   └── AuthContext.jsx   ← Auth state, login/logout
        ├── components/
        │   ├── Sidebar.jsx       ← Role-based navigation
        │   ├── ProtectedLayout.jsx ← Auth + role guard
        │   └── UI.jsx            ← Shared components (Badge, Header, etc.)
        ├── pages/
        │   ├── LoginPage.jsx     ← Login with demo quick-fill
        │   ├── DashboardPage.jsx ← Role-specific dashboards
        │   ├── VouchersListPage.jsx  ← List with search/filter/sort
        │   ├── VoucherFormPage.jsx   ← Create & edit voucher form
        │   ├── VoucherDetailPage.jsx ← Detail view + approve/reject modals
        │   └── PendingApprovalsPage.jsx ← Director's approval queue
        └── utils/
            ├── api.js            ← Axios instance with JWT interceptor
            └── constants.js      ← Shared constants & formatting helpers
```

---

## 🗄 Database Schema

### `users` table

| Column        | Type     | Constraints                                 | Description            |
| ------------- | -------- | ------------------------------------------- | ---------------------- |
| `id`          | INTEGER  | PRIMARY KEY AUTOINCREMENT                   | Unique identifier      |
| `name`        | TEXT     | NOT NULL                                    | Full name              |
| `email`       | TEXT     | UNIQUE NOT NULL                             | Login email            |
| `password`    | TEXT     | NOT NULL                                    | Bcrypt-hashed password |
| `role`        | TEXT     | CHECK IN ('employee','director','accounts') | User role              |
| `employee_id` | TEXT     |                                             | Optional employee code |
| `department`  | TEXT     |                                             | Department name        |
| `created_at`  | DATETIME | DEFAULT CURRENT_TIMESTAMP                   |                        |
| `updated_at`  | DATETIME | DEFAULT CURRENT_TIMESTAMP                   |                        |

### `vouchers` table

| Column                | Type     | Constraints                                          | Description                           |
| --------------------- | -------- | ---------------------------------------------------- | ------------------------------------- |
| `id`                  | INTEGER  | PRIMARY KEY AUTOINCREMENT                            | Unique identifier                     |
| `voucher_number`      | TEXT     | UNIQUE NOT NULL                                      | Auto-generated (VCH-YYYYMM-NNNN)      |
| `voucher_date`        | TEXT     | NOT NULL                                             | Date of voucher creation              |
| `expense_date`        | TEXT     | NOT NULL                                             | Date expense was incurred             |
| `department`          | TEXT     | NOT NULL                                             | Department (mandatory)                |
| `expense_title`       | TEXT     | NOT NULL                                             | Brief expense title (mandatory)       |
| `expense_category`    | TEXT     | NOT NULL                                             | Expense category                      |
| `expense_description` | TEXT     |                                                      | Detailed description                  |
| `amount`              | REAL     | NOT NULL                                             | Expense amount (must be > 0)          |
| `status`              | TEXT     | CHECK IN ('draft','submitted','approved','rejected') | Current workflow status               |
| `employee_id`         | INTEGER  | FK → users.id                                        | Voucher creator                       |
| `employee_name`       | TEXT     | NOT NULL                                             | Denormalized employee name            |
| `employee_code`       | TEXT     |                                                      | Optional employee ID code             |
| `employee_signature`  | TEXT     |                                                      | Relative path to signature image      |
| `director_signature`  | TEXT     |                                                      | Relative path to director's signature |
| `approval_date`       | TEXT     |                                                      | Date of approval                      |
| `rejection_reason`    | TEXT     |                                                      | Mandatory if rejected                 |
| `reviewed_by`         | INTEGER  | FK → users.id                                        | Director who reviewed                 |
| `created_at`          | DATETIME | DEFAULT CURRENT_TIMESTAMP                            |                                       |
| `updated_at`          | DATETIME | DEFAULT CURRENT_TIMESTAMP                            |                                       |

---

## 📡 API Documentation

**Base URL:** `http://localhost:5000/api`

All protected endpoints require the header:

```
Authorization: Bearer <JWT_TOKEN>
```

---

### 🔐 Authentication

#### `POST /api/auth/login`

Login and receive JWT token.

**Request Body:**

```json
{
  "email": "employee@abc.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": {
    "id": 1,
    "name": "John Employee",
    "email": "employee@abc.com",
    "role": "employee",
    "department": "Engineering"
  }
}
```

#### `POST /api/auth/register`

Register a new user.

**Request Body:**

```json
{
  "name": "New User",
  "email": "new@abc.com",
  "password": "securepassword",
  "role": "employee",
  "employee_id": "EMP003",
  "department": "Engineering"
}
```

---

### 📋 Vouchers

#### `GET /api/vouchers`

Get list of vouchers. Employees only see their own; Directors/Accounts see all.

**Query Parameters:**

| Parameter          | Type   | Description                                                           |
| ------------------ | ------ | --------------------------------------------------------------------- |
| `search`           | string | Search voucher #, employee name, department                           |
| `status`           | string | Filter: `draft`, `submitted`, `approved`, `rejected`                  |
| `department`       | string | Filter by department                                                  |
| `expense_category` | string | Filter by category                                                    |
| `employee_name`    | string | Filter by employee name                                               |
| `date_from`        | date   | Expense date range start (YYYY-MM-DD)                                 |
| `date_to`          | date   | Expense date range end (YYYY-MM-DD)                                   |
| `amount_min`       | number | Minimum amount filter                                                 |
| `amount_max`       | number | Maximum amount filter                                                 |
| `sort_by`          | string | Field to sort: `created_at`, `amount`, `status`, `expense_date`, etc. |
| `sort_dir`         | string | `ASC` or `DESC` (default: `DESC`)                                     |
| `page`             | number | Page number (default: 1)                                              |
| `limit`            | number | Items per page (default: 20)                                          |

**Response:**

```json
{
  "success": true,
  "data": [ ...vouchers ],
  "pagination": { "total": 50, "page": 1, "limit": 20, "pages": 3 }
}
```

#### `GET /api/vouchers/:id`

Get single voucher detail. Employees can only access their own.

#### `POST /api/vouchers`

Create a new voucher. **Employee only.** Multipart form data.

| Field                 | Required  | Description           |
| --------------------- | --------- | --------------------- |
| `voucher_date`        | Yes       | Date of voucher       |
| `expense_date`        | Yes       | Date expense occurred |
| `department`          | Yes       | Department name       |
| `expense_title`       | Yes       | Brief title           |
| `expense_category`    | Yes       | Category              |
| `expense_description` | No        | Detailed notes        |
| `amount`              | Yes       | Amount > 0            |
| `employee_name`       | Yes       | Employee full name    |
| `employee_code`       | No        | Employee ID code      |
| `action`              | Yes       | `draft` or `submit`   |
| `employee_signature`  | If submit | Image file            |

#### `PUT /api/vouchers/:id`

Update a Draft voucher. **Employee only, Draft status only.** Same fields as POST.

#### `DELETE /api/vouchers/:id`

Delete a Draft voucher. **Employee only, Draft status only.**

#### `POST /api/vouchers/:id/approve`

Approve a submitted voucher. **Director only.** Multipart form data.

| Field                | Required | Description                |
| -------------------- | -------- | -------------------------- |
| `director_signature` | Yes      | Director's signature image |

#### `POST /api/vouchers/:id/reject`

Reject a submitted voucher. **Director only.**

```json
{
  "rejection_reason": "Please provide original receipts for all expenses above ₹500."
}
```

---

### 📊 Dashboard

#### `GET /api/dashboard/employee` — Employee only

Returns: `{ total, draft, submitted, approved, rejected, total_amount_claimed, total_approved_amount }` + recent 5 vouchers

#### `GET /api/dashboard/director` — Director only

Returns: `{ pending_approval, approved_today, rejected_today, total_pending_amount, total_vouchers }` + recent activity + pending queue

#### `GET /api/dashboard/accounts` — Accounts only

Returns: `{ total, pending_approval, approved, rejected, total_approved_amount }` + recent approved vouchers

---

## ✅ Validation Rules

| Rule                                             | Implementation                                     |
| ------------------------------------------------ | -------------------------------------------------- |
| Department is mandatory                          | Backend + frontend validation                      |
| Expense Title is mandatory                       | Backend + frontend validation                      |
| Expense Date is mandatory                        | Backend + frontend validation                      |
| Amount is mandatory                              | Backend + frontend validation                      |
| Amount must be > 0                               | Backend: `amount > 0` check; Frontend: `min: 0.01` |
| Employee Signature required for submission       | Backend + frontend check                           |
| Director Signature required for approval         | Backend check                                      |
| Rejection Reason mandatory                       | Backend: rejects empty/null                        |
| Voucher Number must be unique                    | DB: `UNIQUE` constraint + auto-generated           |
| Only Draft vouchers can be edited                | Backend: 400 error if not draft                    |
| Only Draft vouchers can be deleted               | Backend: 400 error if not draft                    |
| Only submitted vouchers can be approved/rejected | Backend status check                               |
| Employees can only see own vouchers              | Backend: WHERE employee_id = userId                |

---

## 💡 Assumptions

1. **SQLite for simplicity** — Chosen for zero-configuration setup (no DB server needed). The codebase is easily migrated to PostgreSQL or MySQL by replacing the `better-sqlite3` driver with `pg` or `mysql2` and updating query syntax.

2. **Signature as image file upload** — A digital signature is captured as an image upload (PNG/JPG/GIF/WebP, max 5MB). In a production system, a canvas-based digital signature pad would be more appropriate.

3. **Voucher Number format** — Auto-generated as `VCH-YYYYMM-NNNN` (e.g., `VCH-202601-0001`), sequential per calendar month. Numbers reset at the start of each month.

4. **Currency** — All amounts are denominated in Indian Rupees (₹/INR).

5. **No email notifications** — Status-change email alerts (e.g., "Your voucher has been approved") are out of scope for this assignment.

6. **No password reset** — Self-service password reset is out of scope.

7. **Local file storage** — Uploaded signatures are stored in `backend/uploads/signatures/`. In production, cloud object storage (AWS S3, Google Cloud Storage) should be used.

8. **Employee name is editable** — The voucher form pre-fills the logged-in user's name but allows editing, to support scenarios where a manager submits on behalf of a team member.

9. **Multiple directors allowed** — Multiple users can hold the `director` role. Any director can approve/reject any submitted voucher.

10. **Session persistence** — JWT tokens are stored in `localStorage`. A more secure production implementation would use `HttpOnly` cookies.

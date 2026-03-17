# 📚 Mess-Canteen-Mangement-Software - Technical Documentation

A comprehensive, full-stack **Mess-Canteen-Mangement-Software** for handling student billing, attendance tracking, staff management, side income, and daily collections. Built with modern web technologies featuring a responsive UI, robust backend API, and automated billing logic.

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16.1.1 (App Router), React 19, TypeScript, Tailwind CSS 4, Lucide Icons |
| **State Management** | React Query (@tanstack/react-query), React Context API |
| **HTTP Client** | Axios with interceptors |
| **Backend** | Node.js, Express.js 5.2.1 |
| **Database** | MongoDB with Mongoose 9.0.2 |
| **Authentication** | JWT (JSON Web Tokens), BCrypt password hashing |
| **Validation** | Joi schema validation |
| **Security** | Helmet, CORS, HttpOnly cookies, Express Rate Limit |

---

## 📂 Project Structure

```
Mess-Canteen-Mangement-Software/
├── frontend/                     # Next.js Application
│   ├── app/                      # App Router Pages
│   │   ├── page.tsx              # Landing page
│   │   ├── layout.tsx            # Root layout with providers
│   │   ├── login/page.tsx        # Authentication page (with Return to Home nav)
│   │   ├── owner/                # Owner dashboard & features
│   │   │   ├── page.tsx          # Main dashboard with stats
│   │   │   ├── layout.tsx        # Owner layout with sidebar
│   │   │   ├── admins/           # Admin team management
│   │   │   ├── attendance/       # Attendance management
│   │   │   ├── daily-entries/    # Daily cash/online collection
│   │   │   ├── holidays/         # Holiday management
│   │   │   ├── profile/          # Admin profile & settings
│   │   │   ├── side-income/      # Extra income tracking
│   │   │   ├── students/         # Student registry & plans
│   │   │   ├── bills/            # Bill generation & tracking
│   │   │   └── staff/            # Staff & expense management
│   │   └── student/page.tsx      # Student dashboard (view bills)
│   ├── components/               # Reusable UI Components
│   ├── context/                  # AuthContext Provider
│   ├── lib/                      # API client & Providers
│   └── package.json              # Frontend config
│
├── backend/                      # Express.js API Server
│   ├── controllers/              # Business Logic (9 controllers)
│   │   ├── authController.js     # Login, profile, admins
│   │   ├── dailyEntryController.js # Daily collections
│   │   ├── sideIncomeController.js # Side revenue
│   │   └── ... (6 others)
│   ├── models/                   # Mongoose Schemas (10 models)
│   │   ├── userModel.js          # Students & Admins
│   │   ├── dailyEntryModel.js    # Cash/Online intake
│   │   ├── sideIncomeModel.js    # Non-subscription income
│   │   └── ... (7 others)
│   ├── routes/                   # API Route Definitions (9 routers)
│   ├── middleware/               # Auth & Error middlewares
│   ├── server.js                 # Entry point
│   └── seed.js                   # Database seeder
│
├── start_all.py                  # Startup script
└── package.json                  # Root workspace config
```

---

## 🗃️ Database Schema (Key Models)

### Users Collection
Handles students and administrative users (Owners/Managers).

| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Full name |
| `mobile` | String | Unique mobile number (login identity) |
| `role` | Enum | `OWNER`, `STUDENT`, `MANAGER` |
| `plan` | String | Billing plan (e.g., '2 Time', '1 Time') |
| `diet` | Enum | `Veg` or `Non Veg` |
| `gender` | Enum | `boys` or `girls` |
| `mealSlot` | Enum | `AFTERNOON`, `NIGHT`, `BOTH` |
| `paid` | Number | Total amount paid |
| `amount` | Number | Total billable amount |
| `isDeleted` | Boolean | Soft delete flag |

### DailyEntries Collection
Tracks daily operational intake.

| Field | Type | Description |
|-------|------|-------------|
| `date` | String | YYYY-MM-DD format |
| `slot` | String | 'Lunch', 'Dinner', etc. |
| `online` | Number | Digital payments |
| `cash` | Number | Physical cash payments |

---

## 💻 API Reference Highlights

### Authentication
- `POST /api/auth/login` - Authenticate users
- `GET  /api/auth/me` - Get current session
- `PUT  /api/auth/profile` - Update admin details
- `PUT  /api/auth/password` - Change security credentials

### Management (Owner Only)
- `/api/auth/admins` - CRUD for administrative team
- `/api/daily-entries` - CRUD for daily collections
- `/api/side-income` - CRUD for extra revenue tracking
- `/api/students` - Full student life-cycle management
- `/api/bills/generate` - Bulk monthly bill generation

### Super Admin
- `GET /api/super-admin/stats` - Platform-wide statistics
- `GET /api/super-admin/system-health` - System diagnostics (DB, memory, collections, environment)
- `GET /api/super-admin/messes` - List all mess instances
- `POST /api/super-admin/messes` - Create mess with owner
- `DELETE /api/super-admin/messes/:id` - Suspend a mess

---

## 🔐 Authorization Levels

| Role | Access Level | Responsibilities |
|------|--------------|------------------|
| **SUPER_ADMIN** | Platform | Multi-mess management, System health diagnostics |
| **OWNER** | Full | Financials, Staff, Admin management, System config |
| **MANAGER** | Partial | Attendance, Student registry, Daily entry recording |
| **STUDENT** | Restricted | Personal bill view, Profile view |

---

## 🎨 Frontend Architecture

### Page Structure (Owner Dashboard)

| Route | Functionality |
|-------|---------------|
| `/owner` | Key metrics (Revenue, Pending, Expenses, Income) |
| `/owner/admins` | Adding/Removing system administrators |
| `/owner/daily-entries` | Logging daily canteen sales (Cash vs Online) |
| `/owner/students` | Enrollment, Plan management, and Attendance history |
| `/owner/attendance` | Mark absence and view **Global Meal Requirements** (Veg/Non-Veg counts) |
| `/owner/bills` | Monthly bill calculation and WhatsApp notification |
| `/owner/side-income` | Recording non-mess revenue (Guest entries, etc.) |
| `/owner/staff` | Salary tracking and operational expenses |

### Super Admin Dashboard

| Tab | Functionality |
|-----|---------------|
| **Mess Management** | Create, view, and suspend mess instances with owner info |
| **System Health** | DB connection check, ping latency, collection stats, server memory/CPU, environment config validation |

### Login Page

| Element | Details |
|---------|----------|
| `/login` | Authentication form with "Return to Home" button for easy navigation back to the landing page |

---

## 📱 Features

### Smart Billing
Automated calculation based on student plans, attendance records, and rebates for missed meals.

### WhatsApp Integration
Click-to-chat links for sending bills directly to student mobile numbers.

### UPI Payments
Deep-link generation (`upi://pay`) for one-click payments via any UPI app.

### Advanced Attendance
Two-shift (Afternoon/Night) marking system with bulk update support and **Daily Kitchen Planning Cards** (Present vs On-Leave metrics).

### Dynamic Student Metrics
Real-time calculation of custom cycle end dates based on holidays, personal leaves, and remaining meal allowances.

---

## 🚀 Getting Started

1. **Setup Environment**: Create a `.env` in the root with `DATABASE_URL` and `JWT_SECRET`.
2. **Install Dependencies**: `npm install`
3. **Run Application**: `npm run dev` (Starts both Next.js and Express).
4. **Seed Data**: `node backend/seed.js` for test accounts.

---

*Last Updated: March 2026 (v1.3.0)*

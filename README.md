# 🍽️ Mess-Canteen-Mangement-Software

A full-stack web application for managing mess/canteen operations including student billing, attendance tracking, staff management, side income, and daily collections.

![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## ✨ Features

### For Owners/Admins
- 📊 **Dashboard** - Real-time stats on revenue, expenses, side income, and student count
- 👥 **Student Management** - Add, edit, soft-delete students with flexible pricing plans
- 📅 **Attendance Tracking** - Mark daily attendance with **Live Meal Requirement Cards** (Total Present, On Leave, Veg/Non-Veg counts) to plan daily food preparation
- 💰 **Daily Collections** - Track daily cash vs online intake from canteen sales
- 📈 **Side Income** - Manage additional revenue streams (Guest entries, Extra meals, etc.)
- 💰 **Bill Generation** - Automated monthly billing with attendance-based calculations
- 📱 **WhatsApp Integration** - Send bill reminders with one click
- 👨‍🍳 **Staff & Expenses** - Track staff salaries and operational expenses
- 🛡️ **Admin Team** - Add multiple administrative users with distinct roles (OWNER/MANAGER)

### For Super Admins
- 🏢 **Multi-Mess Management** - Create, view, and suspend mess instances
- 🔧 **System Health Dashboard** - Real-time diagnostics with DB connection status, ping latency, collection stats, server memory & CPU, and environment config checks

### General
- 🏠 **Return to Home** - Quick navigation back to the landing page from the login screen

### For Students
- 📊 **Dynamic Dashboard** - Real-time tracking of **Remaining Meals**, **Joining Date**, and **Automated Cycle End Date** (adjusts for holidays/plans)
- 📄 **View Bills** - See pending and paid bills
- 📥 **Download PDF Bills** - Get detailed PDF with payment breakdown
- 💳 **UPI Payment** - Pay directly via UPI deep links
- 📅 **Personal Holidays** - View marked absences and cycle validity status

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16.1.1 (App Router), React 19, TypeScript, Tailwind CSS 4, Lucide Icons |
| **Backend** | Node.js, Express.js 5.2.1 |
| **Database** | MongoDB with Mongoose 9.0.2 |
| **Auth** | JWT + BCrypt |
| **PDF** | PDFKit |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- MongoDB Atlas account ([Free tier](https://mongodb.com/atlas))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aadityaa-Sharma/Mess-Canteen-management-software.git
   cd Mess-Canteen-management-software
   ```

2. **Configure Backend**
   - Create a `.env` file in the root directory.
   - Set `DATABASE_URL` (MongoDB) and `JWT_SECRET`.

3. **Install & Run**
   ```bash
   npm install
   npm run dev
   ```

---

## 🔑 Default Credentials

| Role | Mobile | Password |
|------|--------|----------|
| **Owner** | `9999999999` | `admin123` |
| **Student** | `9000000001` | `student123` |

---

## 📁 Project Structure

```
Mess-Canteen-Mangement-Software/
├── backend/                 # Express.js API (9 controllers, 10 models)
├── frontend/                # Next.js Application (App Router)
├── documentation.md         # Technical documentation
└── beginner_guide.md        # User-friendly guide
```

---

## 📚 Documentation

- [📖 Technical Documentation](./documentation.md) - API reference, database schema, architecture
- [🔰 Beginner's Guide](./beginner_guide.md) - Step-by-step setup for non-developers

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Aadityaa Sharma** & **Prafull Harer**

---

*Last Updated: March 2026*

*Made with ❤️ for mess owners and students*

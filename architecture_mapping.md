# 🏗️ Mess-Canteen-Mangement-Software - Full Feature Mapping

This document provides a deep-dive mapping between the **Frontend**, **Backend**, and **Database** for every function in the project.

---

## 🔑 1. Authentication & Session
| Function | Frontend (UI/Control) | Backend (Route/Controller) | Database (Model/Query) |
|:---|:---|:---|:---|
| **Login** | `login/page.tsx` (`handleSubmit`) | `POST /api/auth/login` (`loginUser`) | `User.findOne({ mobile })` |
| **Verify Session** | `AuthContext.tsx` (`checkAuth`) | `GET /api/auth/me` (`getMe`) | `User.findById(decoded.id)` |
| **Update Profile** | `owner/profile/page.tsx` | `PUT /api/auth/profile` (`updateProfile`) | `User.findByIdAndUpdate` |
| **Change Password** | `owner/profile/page.tsx` | `PUT /api/auth/password` (`changePassword`) | `User.save()` (with bcrypt) |

---

## 👥 2. Student Management (Owner)
| Function | Frontend (UI/Control) | Backend (Route/Controller) | Database (Model/Query) |
|:---|:---|:---|:---|
| **List Students** | `owner/students/page.tsx` | `GET /api/students` (`getStudents`) | `User.find({ role: 'STUDENT' })` |
| **Add Student** | Modal in `owner/students/page.tsx` | `POST /api/students` (`addStudent`) | `User.create({...})` |
| **Edit Student** | Modal in `owner/students/page.tsx` | `PUT /api/students/:id` (`updateStudent`) | `User.findByIdAndUpdate` |
| **Soft Delete** | Trash icon in `owner/students/` | `PUT /api/students/:id` (`deleteStudent`) | `User.findByIdAndUpdate(..., { isDeleted: true })` |

---

## 📅 3. Attendance & Planning (Owner)
| Function | Frontend (UI/Control) | Backend (Route/Controller) | Database (Model/Query) |
|:---|:---|:---|:---|
| **Live Meal Cards** | `owner/attendance/page.tsx` | Local logic + `GET /api/students` | Calculated from `User` & `Holiday` data |
| **Mark Holiday** | Calendar in `owner/attendance/` | `PUT /api/students/:id` (`updateStudent`) | Updates `studentHolidays` array in `User` model |
| **Manage Holidays** | `owner/holidays/page.tsx` | `GET/POST/DELETE /api/holidays` | `Holiday.find()`, `Holiday.create()` |
| **Bulk Attendance** | (Planned/Manual per student) | `POST /api/attendance` | `Attendance.create()` |

---

## 💰 4. Billing & Payments
| Function | Frontend (UI/Control) | Backend (Route/Controller) | Database (Model/Query) |
|:---|:---|:---|:---|
| **Generate Bills** | `owner/bills/page.tsx` | `POST /api/bills/generate` (`generateMonthlyBills`) | `Bill.create()` for all active `User`s |
| **Pay Bill (Owner)** | `owner/bills/page.tsx` | `PUT /api/bills/:id/status` (`updateBillStatus`) | `Bill.findByIdAndUpdate(..., { status: 'PAID' })` |
| **View Bills (Std)** | `student/page.tsx` | `GET /api/bills` (`getStudentBills`) | `Bill.find({ student_id: user.id })` |
| **PDF Download** | `student/page.tsx` (`handleDownload`) | `GET /api/bills/:id/pdf` (`getBillPdf`) | Fetches `Bill` and uses `PDFKit` to stream response |
| **WhatsApp Link** | `owner/bills/` (UI Helper) | N/A (Client-side URL format) | Uses `User.mobile` and `Bill.amount` |

---

## 🍗 5. Daily Collections & Side Income
| Function | Frontend (UI/Control) | Backend (Route/Controller) | Database (Model/Query) |
|:---|:---|:---|:---|
| **Log Collection** | `owner/daily-entries/page.tsx` | `POST /api/daily-entries` (`createEntry`) | `DailyEntry.create()` |
| **History View** | `owner/daily-entries/` | `GET /api/daily-entries` (`getEntries`) | `DailyEntry.find().sort({ date: -1 })` |
| **Log Side Income** | `owner/side-income/page.tsx` | `POST /api/side-income` (`addIncome`) | `SideIncome.create()` |
| **Income Report** | `owner/side-income/` | `GET /api/side-income` (`getIncome`) | `SideIncome.find()` |

---

## 👨‍🍳 6. Staff & Expenses
| Function | Frontend (UI/Control) | Backend (Route/Controller) | Database (Model/Query) |
|:---|:---|:---|:---|
| **Staff List** | `owner/staff/page.tsx` | `GET /api/staff` (`getStaff`) | `Staff.find()` |
| **Pay Salary** | `owner/staff/` | `PUT /api/staff/:id/pay` (`payStaff`) | `Staff.findByIdAndUpdate` + Log Expense |
| **Add Expense** | `owner/staff/` | `POST /api/staff/expenses` (`addExpense`) | `Expense.create()` |

---

## 🛡️ 7. Super Admin (Global Control)
| Function | Frontend (UI/Control) | Backend (Route/Controller) | Database (Model/Query) |
|:---|:---|:---|:---|
| **Manage Messes** | `super-admin/page.tsx` | `GET/POST/DELETE /api/super-admin/messes` | `Mess.find()`, `Mess.create()` |
| **System Health** | `super-admin/` (Health Tab) | `GET /api/super-admin/system-health` | Direct `mongoose.connection` & `process` checks |
| **Create Owner** | Modal in `super-admin/` | `POST /api/auth/register-owner` | `User.create({ role: 'OWNER' })` |

---

## 📂 8. Core Data Models Summary (Database)

1. **User**: Students, Owners, Managers. Fields: `mobile`, `role`, `plan`, `amount`, `paid`, `studentHolidays`.
2. **Mess**: Mess instances managed by Super Admin. Fields: `name`, `ownerId`, `address`.
3. **Bill**: Monthly invoices. Fields: `student_id`, `amount`, `status`, `breakdown`.
4. **DailyEntry**: Canteen sales. Fields: `date`, `slot`, `cash`, `online`.
5. **SideIncome**: Guest feeds, extra meals. Fields: `reason`, `amount`, `date`.
6. **Expense**: Staff salaries, groceries, gas. Fields: `category`, `amount`, `date`.
7. **Holiday**: Global mess holidays. Fields: `dateStr`, `slot`, `name`.

---
*Generated: March 2026*

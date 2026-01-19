
# Full-Stack Property Management System

**HomiQ PMS** is a modern, full-stack Property Management System designed for guesthouses and small hotels. It provides a comprehensive dashboard for managing operations, finance, staff rosters, and guest reservations in real-time.

![HomiQ Dashboard Preview](https://via.placeholder.com/1200x600?text=HomiQ+PMS+Dashboard+Preview)  
*(Note: Replace with actual screenshot)*

## 🚀 Project Overview

This project was built to solve the operational chaos of managing property bookings and finances manually. It transitions management from spreadsheets to a centralized, database-backed web application.

The system features a **Task-Based Workflow** for cleaning staff, an **Interactive Calendar** for reservations, and a **Financial Dashboard** that tracks revenue against targets.

## 🛠 Tech Stack

Built with a high-performance modern stack focusing on type safety and developer experience.

### **Frontend**
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) (Speed & Performance)
- **Language**: TypeScript (Type safety across the app)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Responsive, utility-first design)
- **Charts**: [Chart.js](https://www.chartjs.org/) & `react-chartjs-2` (Financial Visualization)
- **Icons**: Lucide React

### **Backend**
- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Framework**: [Express.js](https://expressjs.com/) (RESTful API architecture)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Relational Data Persistence)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) (Type-safe SQL queries & schema management)
- **Auth**: JWT & Bcrypt (Secure authentication)

### **Deployment**
- **API**: Hosted on Vercel Serverless Functions
- **Database**: Supabase (Cloud PostgreSQL)
- **Frontend**: Vercel Static Edge Network

---

## 📊 Data Features & Logic Calculations

A key component of HomiQ PMS is its ability to process raw data into actionable insights effectively. Below are the core financial formulas implemented in the backend (`apps/api/src/routes/finance.ts`):

### 1. **Financial KPIs**
- **Total Revenue**: Sum of all *confirmed* payments (excluding pending OTA bookings).
  ```sql
  SUM(payments.amount) WHERE payment_date IS NOT NULL
  ```

- **Net Profit**: Revenue minus Operating Expenses.
  ```ts
  Net Profit = Total Revenue - Total Operating Expenses
  ```

- **Outstanding Revenue**: Total value of active reservations minus payments already received.
  ```ts
  Outstanding = MAX(0, Sum(Reservation Total) - Sum(Received Payments))
  ```

### 2. **Month-over-Month (MoM) Growth**
Calculates the performance percentage compared to the previous month.
```ts
Growth % = ((Current Month Revenue - Previous Month Revenue) / Previous Month Revenue) * 100
```
*Logic handles division by zero edge cases.*

### 3. **Occupancy & Targets**
- **Monthly Targets**: Configurable revenue goals per month stored in the database.
- **Realization Rate**: Comparison of `Current Revenue` vs `Target Amount`.

---

## 📂 Project Structure (Monorepo)

The project uses a simple monorepo structure separating concerns:

```
PMS-guesthouse-fullstack/
├── apps/
│   ├── api/          # Express Backend & Drizzle ORM
│   │   ├── src/
│   │   │   ├── db/       # Schema & Migrations
│   │   │   ├── routes/   # API Endpoints (Finance, Guests, etc.)
│   │   │   └── index.ts  # Entry Point
│   │   └── vercel.json   # Serverless Config
│   │
│   └── web/          # React Frontend
│       ├── src/
│       │   ├── components/ # Reusable UI Components
│       │   ├── pages/      # Route Pages (Dashboard, Ops, Finance)
│       │   └── services/   # API Fetchers
│       └── tailwind.config.js
└── package.json
```

## ⚡ Getting Started

### Prerequisites
- Node.js installed
- PostgreSQL Database (Local or Supabase)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/PMS-guesthouse-fullstack.git
   cd PMS-guesthouse-fullstack
   ```

2. **Install Dependencies**
   ```bash
   # Backend
   cd apps/api
   npm install

   # Frontend
   cd ../web
   npm install
   ```

3. **Environment Setup**
   Create `.env` file in `apps/api`:
   ```env
   DATABASE_URL=postgresql://user:pass@host:5432/db
   PORT=3000
   ```

4. **Database Migration**
   ```bash
   cd apps/api
   npm run db:migrate
   ```

5. **Run Development Server**
   ```bash
   # Run API
   cd apps/api && npm run dev

   # Run Web (In separate terminal)
   cd apps/web && npm run dev
   ```

## 🔒 Source Code Access (Download)

The source code for this repository is password protected. To download the full source code:

1. Go to the **[Releases](../../releases)** tab.
2. Download the `HomiQ-Source-Code.zip` file.
3. Extract the ZIP using the password provided by the owner.
4. Follow the installation steps above.

---

## 🛡 Security & Best Practices
- **Password Hashing**: Passwords stored using `bcrypt` (Salted rounds).
- **CORS Protection**: Configured to strict origins in production.
- **SQL Injection Prevention**: Using Drizzle ORM parameterized queries.
- **Type Safety**: Full TypeScript integration from DB Schema to React Props.

---

**© 2026 HomiQ Systems**. Imam Dwi Purwanto.

# SpendWise AI 🎓💰

> **Intelligent College Expense Management & Financial Intelligence Platform**

SpendWise AI is a premium personal finance and expense intelligence web application engineered specifically for college students. It provides actionable spending insights, semester allowance pacing, cafeteria/meal plan tracking, textbook fund budgeting, multi-currency support, and an AI-driven student financial advisor.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS v4, Recharts, Lucide React |
| **Backend** | Python 3.10+ (tested with 3.14), FastAPI, Uvicorn, Pydantic v2, Pandas |
| **Database** | SQLite (Zero-config, local, lightweight, schema auto-migrating) |
| **Currencies** | Multi-currency engine (USD base persistence, live exchange rate syncing, 9 currencies) |
| **AI Engine** | Modular AI service: Deterministic student financial intelligence engine (100% offline, zero-cost fallback) + pluggable external LLM adapter |
| **Testing** | Node.js Test Runner (Frontend unit/logic tests), Python `unittest` (Backend full test suite & API endpoints) |

---

## 🌟 Key Features

### 1. 📊 Executive Dashboard
- **Real-Time Financial Metrics**: Total expenses, monthly spending, remaining monthly budget, active savings overview.
- **Visual Analytics**: Interactive Recharts expense category breakdown (pie/donut charts) and monthly spending trend lines.
- **Recent Transactions Ledger**: Quick view of recent campus expenditures with original currency badges.
- **AI Spotlight**: High-priority student financial tip surfaced directly on the main dashboard.

### 2. 💸 Multi-Currency Expense Ledger
- **Multi-Currency Expense Entry**: Record transactions in any supported currency with an integrated flag/symbol selector.
- **Audit-Proof Base Persistence**: All transactions persist in base USD (`amount`), while preserving the original entered amount (`original_amount`) and currency (`original_currency`) to guarantee financial accuracy and prevent double conversion.
- **Smart Editing**: Edit transactions in their original entered currency or adjust as needed without precision loss.
- **Search & Filter**: Real-time substring search across titles and notes, category filtering tabs, and custom date range filters.

### 3. 🌐 Currency Selection & Exchange Rates
- **9 Supported Global Currencies**:
  - `USD` – US Dollar ($)
  - `INR` – Indian Rupee (₹)
  - `EUR` – Euro (€)
  - `GBP` – British Pound (£)
  - `JPY` – Japanese Yen (¥, zero decimals)
  - `AUD` – Australian Dollar (A$)
  - `CAD` – Canadian Dollar (C$)
  - `SGD` – Singapore Dollar (S$)
  - `AED` – UAE Dirham (د.إ)
- **Live Rate Synchronization**: Live exchange rates with cached memory fallbacks.
- **Independent Currency Sample Calculations**: Settings cards compute samples in each card's target currency and locale.
- **Persistent Preferences**: Active currency preference persists across page reloads via `localStorage`.

### 4. 📁 CSV Import & Pandas Validation Engine
- **Statement Currency Selection**: Specify the statement currency prior to import; backend automatically cleans and converts statement amounts to base USD while storing original transaction amounts.
- **Heuristic Header Mapping**: Case-insensitive detection of columns (`Title`/`Merchant`/`Item`, `Amount`/`Cost`/`Spent`, `Category`, `Date`, etc.).
- **Row-by-Row Pandas Validation**: Identifies missing titles, invalid/negative amounts, and corrupt date formats with precise row-level error feedback.
- **Bulk Ledger Import**: One-click verified batch insert into SQLite.

### 5. 🎯 Category Budgets & Utilization Warnings
- **Monthly Spending Limits**: Set category-specific limits (Dining & Groceries, Books & Academics, Transit, Housing, etc.).
- **Real-Time Utilization Tracking**: Automatic calculation of spent vs. remaining funds.
- **Visual Status Badges**:
  - `Normal` (< 80% utilization)
  - `Warning` (80% – 100% utilization)
  - `Exceeded` (> 100% utilization)

### 6. 📈 Advanced Analytics & Health Score
- **Pandas Data Processing**: Category breakdowns, percentage shares, monthly comparative trends, and daily spending velocity charts.
- **Student Financial Health Score (0–100)**: Dynamic rating derived from allowance burn rate, budget adherence, and savings discipline.

### 7. 🤖 AI Student Financial Advisor
- **Deterministic Student Intelligence**: Analyzes allowance velocity, dining spikes, subscription audits, and textbook spending without requiring paid APIs.
- **Accurate Savings vs. Reserves Separation**: Distinguishes actionable recurring savings from accumulated milestone reserves (e.g. Emergency Funds).
- **Multi-Currency Advice Localization**: Advice strings dynamically convert embedded amounts into the active display currency.

### 8. 🎯 Savings Goals
- **Milestone Tracking**: Create targets (e.g. Laptop Replacement, Spring Break, Emergency Fund).
- **Deposit Increments**: Add funds with progress bar animation and automated milestone completion flags.

---

## 📁 Project Directory Structure

```text
SpendWise-AI/
├── frontend/                     # React + Vite + TypeScript Client
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/       # Metric cards, overview spotlights
│   │   │   ├── layout/          # Navbar, Sidebar, Currency selectors
│   │   │   └── modals/          # Add/Edit Expense, Budget, Goal modals
│   │   ├── context/             # CurrencyContext (rates, formats, conversions)
│   │   ├── services/            # API client (expenses, budgets, AI, analytics)
│   │   ├── types/               # TypeScript interfaces & definitions
│   │   ├── utils/               # currency.ts formatting, conversions & localization
│   │   ├── views/               # Views (Dashboard, Ledger, CSV, Budgets, AI, etc.)
│   │   ├── App.tsx              # Main dashboard routing & state
│   │   └── main.tsx             # Application mount point
│   ├── tests/                   # Automated Node.js frontend tests
│   ├── .env.example             # Frontend environment template
│   ├── package.json             # NPM dependencies & test scripts
│   └── vite.config.ts           # Vite + Tailwind CSS v4 configuration
│
├── backend/                      # Python FastAPI Service
│   ├── app/
│   │   ├── api/                 # API routers (/health, /expenses, /currencies, etc.)
│   │   ├── core/                # Configuration & SQLite connection
│   │   ├── data/                # Synthetic sample student datasets
│   │   ├── models/              # Pydantic validation schemas
│   │   ├── services/            # Expense, Analytics, AI & Currency services
│   │   └── main.py              # FastAPI application entrypoint & lifespan
│   ├── tests/                   # Automated backend test suites
│   │   ├── test_full_suite.py   # Isolated database end-to-end service tests
│   │   └── test_api_endpoints.py# Router & API endpoint unit tests
│   ├── test_api.py              # System verification script
│   ├── .env.example             # Backend environment template
│   └── requirements.txt         # Python dependencies
│
├── .gitignore                    # Excludes virtual environments, DBs & caches
├── .env.example                  # Root environment template
└── README.md                     # Setup instructions & documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** v18+ and **npm**
- **Python** 3.10+ (tested with Python 3.14)

---

### 1. Backend Setup (FastAPI)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Activate the virtual environment:
   - **Windows (PowerShell)**:
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Windows (cmd)**:
     ```cmd
     venv\Scripts\activate.bat
     ```
   - **macOS / Linux**:
     ```bash
     source venv/bin/activate
     ```

3. (If creating a fresh virtual environment):
   ```bash
   python -m venv venv
   pip install -r requirements.txt
   ```

4. Create environment file:
   ```bash
   cp .env.example .env
   ```

5. Start the FastAPI backend server:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```

The backend automatically creates `spendwise.db` SQLite database, initializes tables with column migrations, and seeds synthetic student data.
- **API Base**: `http://127.0.0.1:8000/api/v1`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **Health Check**: `http://127.0.0.1:8000/api/v1/health`

---

### 2. Frontend Setup (React + Vite)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Configure environment file:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   ```text
   http://localhost:5173
   ```

---

## 🧪 Automated Testing Suite

SpendWise AI includes automated test suites covering both frontend logic and backend services.

### Frontend Automated Tests
Runs unit tests for currency conversions, text regex localization, budget calculations, and goal progress:
```bash
cd frontend
npm test
```

To run linter and production build verification:
```bash
npm run lint
npm run build
```

### Backend Automated Test Suite
Runs tests across an isolated, temporary SQLite database:
```bash
cd backend
.\venv\Scripts\python -m unittest discover -s tests -p "test_*.py"
```

To run the full end-to-end integration script:
```bash
cd backend
.\venv\Scripts\python test_api.py
```

---

## 📡 API Reference Overview

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/health` | `GET` | Health status and engine metadata |
| `/api/v1/currencies` | `GET` | Supported currencies list (9 currencies) |
| `/api/v1/currencies/rates` | `GET` | Current exchange rates against base USD |
| `/api/v1/expenses` | `GET` | List expenses with search, category, and date filtering |
| `/api/v1/expenses` | `POST` | Record an expense with multi-currency support |
| `/api/v1/expenses/{id}` | `PUT` | Update an existing expense |
| `/api/v1/expenses/{id}` | `DELETE` | Delete an expense record |
| `/api/v1/expenses/csv-preview` | `POST` | Upload and preview CSV statement with Pandas validation |
| `/api/v1/expenses/csv-import` | `POST` | Bulk import confirmed records into ledger |
| `/api/v1/budgets` | `GET` | List all monthly category budgets and utilization |
| `/api/v1/budgets` | `POST` | Upsert a category monthly spending limit |
| `/api/v1/budgets/{id}` | `DELETE` | Delete a category budget |
| `/api/v1/savings-goals` | `GET` | List all savings goals and completion status |
| `/api/v1/savings-goals` | `POST` | Create a new savings target |
| `/api/v1/savings-goals/{id}/deposit` | `POST` | Record a deposit toward a savings goal |
| `/api/v1/insights/overview` | `GET` | Financial overview and health score |
| `/api/v1/insights/monthly-trends` | `GET` | Monthly spending vs budget comparisons |
| `/api/v1/insights/daily-spending` | `GET` | Daily expense totals for velocity chart |
| `/api/v1/ai/insights` | `GET` | AI Student Advisor recommendations (currency-localized) |

---

## 🔒 Security & Privacy Compliance

- **Zero Paid Dependencies**: The default rule-based engine operates completely offline at zero API cost.
- **Privacy First**: No real bank credentials or financial logins are ever accessed; all demo data uses synthetic student transactions.
- **Secret Protection**: `.env`, `.env.local`, SQLite databases (`*.db`), and virtual environments are strictly excluded via `.gitignore`.

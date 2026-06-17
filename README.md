# 💸 SpendFlow — Gmail Expense Tracker

A full-stack personal finance tracker that automatically extracts and categorises expenses from your Gmail inbox. Connect your Google account, sync your inbox, upload your bank statement for cross-verification, and get a rich analytics dashboard — all in one place.

---

## 📁 Project Structure

```
gmail-expense-tracker/
├── package.json              ← Root scripts (install-all, run backend/frontend)
├── backend/                  ← Node.js + Express API server
│   ├── server.js             ← All REST API routes
│   ├── gmail-client.js       ← Google Gmail OAuth integration
│   ├── parser.js             ← Regex email → expense parser
│   ├── statement-parser.js   ← CSV bank statement parser (HDFC, ICICI, SBI, Axis, Kotak)
│   ├── statement-reconcile.js← Cross-verification & DB update engine
│   ├── reclassify.js         ← Batch category reclassification helper
│   ├── db.js                 ← MongoDB schemas (Expense + Config)
│   ├── .env                  ← Your environment variables (NOT committed)
│   └── .env.example          ← Template for .env
└── frontend/                 ← React 19 + Vite SPA
    ├── src/
    │   ├── App.jsx           ← Entire UI, state management, all modals
    │   └── index.css         ← Styling / design system
    └── .env.example          ← Template for frontend .env
```

---

## ✅ Prerequisites

Make sure the following are installed on your machine before starting:

| Tool | Version | Install |
|---|---|---|
| **Node.js** | v18+ | https://nodejs.org |
| **npm** | v9+ | Comes with Node.js |
| A modern browser | Chrome / Edge / Firefox | — |

You also need:
- A **MongoDB Atlas** account (free tier is enough) — https://mongodb.com/atlas
- A **Google Cloud** project with the Gmail API enabled (for live sync) — https://console.cloud.google.com

> **Note:** The app fully works in **Demo Sandbox mode** without MongoDB or Google credentials. Set those up only when you want to connect real Gmail data.

---

## 🚀 Quick Start (Local Development)

### Step 1 — Clone & Install Dependencies

```bash
# From the project root directory
cd gmail-expense-tracker

# Install dependencies for BOTH backend and frontend in one command
npm run install-all
```

This runs `npm install` inside both `backend/` and `frontend/`.

---

### Step 2 — Configure the Backend Environment

Navigate into the `backend/` folder and create your `.env` file:

```bash
cd backend
copy .env.example .env
```

Open `.env` and fill in the values:

```env
# ── Required ──────────────────────────────────────────────────────────────────

# Your MongoDB Atlas connection string
# Get this from: Atlas Dashboard → Connect → Drivers → Node.js
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/spendflow?retryWrites=true&w=majority

# The URL where your frontend runs locally
FRONTEND_URL=http://localhost:5173

# Port for the backend server (3001 is the default)
PORT=3001

# ── Optional (Google OAuth — needed only for Gmail sync) ──────────────────────

# If you prefer env-variable-based credentials instead of the in-app Setup Wizard:
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/callback
```

> **MongoDB Atlas quick setup:**
> 1. Go to https://cloud.mongodb.com → Create a free cluster
> 2. Go to **Database Access** → Add a user with read/write permissions
> 3. Go to **Network Access** → Allow your IP (or `0.0.0.0/0` for development)
> 4. Click **Connect** → **Drivers** → Copy the Node.js connection string
> 5. Replace `<username>` and `<password>` in the string

---

### Step 3 — Run the Backend Server

Open a terminal in the **project root** and run:

```bash
npm run backend
```

Or run it directly from the `backend/` folder:

```bash
cd backend
npm run dev        # Development mode with auto-reload (nodemon)
# OR
npm start          # Production mode (plain node)
```

**Expected output:**
```
[nodemon] starting `node server.js`
Connecting to MongoDB...
Server running at http://localhost:3001
Successfully connected to MongoDB.
```

The backend API is now live at: **`http://localhost:3001`**

---

### Step 4 — Configure the Frontend Environment (Optional)

The frontend automatically connects to `http://localhost:3001` by default. You only need to create a `.env` file if the backend is on a different URL (e.g., deployed to Render):

```bash
cd frontend
copy .env.example .env
```

Edit `.env`:

```env
# Only set this if your backend is NOT running on http://localhost:3001
VITE_API_URL=http://localhost:3001
```

---

### Step 5 — Run the Frontend

Open a **second terminal** in the project root and run:

```bash
npm run frontend
```

Or from the `frontend/` folder:

```bash
cd frontend
npm run dev
```

**Expected output:**
```
  VITE v8.x.x  ready in 300ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your browser at: **`http://localhost:5173`**

---

## 🎮 Using the App

### Demo Sandbox (No setup required)

When you first open the app, it loads in **Demo Sandbox mode** with 20+ pre-loaded realistic Indian expense transactions. You can explore every feature without any credentials.

---

### Connecting Gmail for Live Sync

To sync your actual Gmail inbox, you need to set up Google OAuth. This is a one-time setup.

#### Step A — Create a Google Cloud Project

1. Go to https://console.cloud.google.com
2. Click **"New Project"** → give it any name (e.g. `spendflow-local`)
3. In the left sidebar → **APIs & Services** → **Library**
4. Search for **"Gmail API"** → Click **Enable**

#### Step B — Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"+ Create Credentials"** → **OAuth client ID**
3. If prompted, configure the **OAuth Consent Screen** first:
   - User Type: **External**
   - App name: anything (e.g. `SpendFlow`)
   - Add your email as a test user
4. Back to creating credentials:
   - Application type: **Web application**
   - **Authorised redirect URIs** → Add: `http://localhost:3001/api/auth/callback`
5. Click **Create** → Copy the **Client ID** and **Client Secret**

#### Step C — Enter Credentials in the App

1. In the app navbar, change the dropdown from `✨ Demo Sandbox` → `📁 Live Workspace / Local DB`
2. Click the **🔌 Connect Gmail** button
3. In the Setup Wizard modal, paste your **Client ID** and **Client Secret**
4. Click **Save Credentials**
5. Click **Connect with Google** → Approve the consent screen
6. You'll be redirected back to the app, now authenticated

#### Step D — Sync Your Inbox

Click the **🔄 Sync Inbox** button in the navbar. The app will:
- Search your Gmail for transaction/payment/receipt emails (from Jan 2026 onwards)
- Parse amounts, merchants, and categories
- Save everything to MongoDB

---

### Uploading a Bank Statement (CSV Reconciliation)

This feature cross-checks your bank's records against what was parsed from Gmail, corrects categories, and adds any missing transactions.

#### Supported Banks
| Bank | CSV Format Detected |
|---|---|
| HDFC Bank | ✅ Auto-detected |
| ICICI Bank | ✅ Auto-detected |
| SBI | ✅ Auto-detected |
| Axis Bank | ✅ Auto-detected |
| Kotak Mahindra | ✅ Auto-detected |
| Any other bank | ✅ Generic fallback |

#### How to Export Your CSV Statement

**HDFC:**
> NetBanking → Accounts → Savings Account → Download Statement → Select date range → CSV format

**ICICI:**
> iMobile / NetBanking → Accounts → Transaction History → Download → CSV

**SBI:**
> OnlineSBI → Accounts → Statement of Account → Download as CSV

**Axis:**
> Axis Mobile → Account → Statement → Export as CSV

#### Uploading in the App

1. Make sure you're in **📁 Live Workspace / Local DB** mode
2. Click **📊 Upload Statement** button (in the welcome section)
3. In the modal, click **Choose File** and select your downloaded `.csv`
4. Click **Upload & Reconcile**

**What happens next:**
- Matches each bank transaction to an existing expense by **date (±2 days)** and **amount (±2%)**
- **Updates** category/merchant on matched records if the bank narration gives a better signal
- **Inserts** any bank transactions not found in your Gmail expenses (new rows prefixed `stmt-`)
- Shows a full reconciliation report: matched, updated, added counts with details

---

## 📡 API Reference

All endpoints are served from `http://localhost:3001`.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/auth/status` | Check if credentials & token exist |
| `POST` | `/api/auth/credentials` | Save Google OAuth client ID/secret |
| `GET` | `/api/auth/url` | Get Google consent screen URL |
| `GET` | `/api/auth/callback` | OAuth redirect handler (called by Google) |
| `POST` | `/api/auth/logout` | Remove stored tokens |

### Expenses

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/expenses` | Get all expenses (sorted by date desc) |
| `POST` | `/api/expenses` | Add a manual expense |
| `PUT` | `/api/expenses/:id` | Update expense fields (category, merchant, etc.) |
| `DELETE` | `/api/expenses/:id` | Delete an expense |

### Gmail Sync

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/sync` | Fetch & parse Gmail inbox into DB |
| `POST` | `/api/upload-raw` | Parse a manually pasted email body |

### Bank Statement

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload-statement` | Upload a CSV bank statement for reconciliation |

---

## 🗄️ Database Schema

SpendFlow uses two MongoDB collections:

### `expenses` collection

```
id          String    Unique identifier (gmail msg ID / 'manual-...' / 'stmt-...')
date        Date      Transaction date
amount      Number    Transaction amount
currency    String    'INR' or 'USD'
merchant    String    Merchant name (parsed or inferred)
category    String    One of the categories below
subject     String    Email subject line
snippet     String    First 150 chars of email body
from        String    Sender email address
bodySummary String    First 500 chars of email body
```

### Expense Categories

`Salary` · `Investment` · `Rent` · `Credit Card` · `UPI Payment` · `Food Delivery` · `Dining Out` · `Travel & Commute` · `Shopping` · `Subscriptions & Entertainment` · `Utilities & Bills` · `Other`

### `configs` collection
Stores Google OAuth credentials and tokens for cloud-persistent authentication.

---

## 🛠️ Available npm Scripts

### Root directory (`gmail-expense-tracker/`)

```bash
npm run install-all   # Install dependencies for backend AND frontend
npm run backend       # Start backend in dev mode (nodemon)
npm run frontend      # Start frontend dev server (Vite)
npm start             # Start backend in production mode
```

### Backend (`backend/`)

```bash
npm run dev           # Start with nodemon (auto-restart on file changes)
npm start             # Start with plain node (production)
```

### Frontend (`frontend/`)

```bash
npm run dev           # Start Vite dev server (HMR enabled)
npm run build         # Build for production → outputs to dist/
npm run preview       # Preview the production build locally
npm run lint          # Run ESLint
```

---

## ☁️ Cloud Deployment (Optional)

### Backend — Deploy to Render

1. Push your project to GitHub
2. Go to https://render.com → **New Web Service**
3. Connect your GitHub repo, set **Root Directory** to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add these **Environment Variables** in Render dashboard:
   ```
   MONGODB_URI      = <your Atlas connection string>
   FRONTEND_URL     = https://your-app.vercel.app
   PORT             = 10000
   GOOGLE_CLIENT_ID     = (optional, or use in-app wizard)
   GOOGLE_CLIENT_SECRET = (optional, or use in-app wizard)
   GOOGLE_REDIRECT_URI  = https://your-api.onrender.com/api/auth/callback
   ```

> **Important:** Update your Google OAuth credential's **Authorised redirect URI** to your Render URL: `https://your-api.onrender.com/api/auth/callback`

### Frontend — Deploy to Vercel

1. Go to https://vercel.com → **New Project** → Import your GitHub repo
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   ```
   VITE_API_URL = https://your-api.onrender.com
   ```
4. Deploy

---

## 🔧 Troubleshooting

### Backend won't start
- Check that your `MONGODB_URI` in `.env` is correct and your IP is whitelisted in Atlas Network Access
- Make sure port 3001 isn't already in use: `netstat -ano | findstr :3001` (Windows)

### "Could not connect to backend server"
- Ensure the backend is running on port 3001 before starting the frontend
- Check the browser console for CORS errors — the backend allows all origins by default

### Gmail Sync returns 0 results
- Confirm you approved the Gmail readonly scope on the Google consent screen
- The default query only searches from **Jan 1, 2026** — adjust via the API if needed
- Check that your Gmail has emails with keywords like: `receipt`, `payment`, `debited`, `order`, `invoice`

### Bank statement upload fails
- Only **CSV format** is supported — not PDF
- Make sure you downloaded the statement as CSV/Excel-CSV from your bank's NetBanking portal
- Some banks add metadata rows above the header — the parser auto-detects and skips up to 15 header rows

### OAuth redirect error after login
- Double-check the **Authorised redirect URI** in Google Cloud Console exactly matches `http://localhost:3001/api/auth/callback`
- Trailing slashes and `http` vs `https` must match exactly

---

## 📝 License

ISC License — free to use, modify, and distribute.

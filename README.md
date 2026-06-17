# Gmail Expense Tracker 📧💰

This project leverages your Gmail inbox to automatically track and categorize your expenses. It parses transaction emails, extracts key details, and provides a user-friendly dashboard for visualizing your spending habits. It also supports manual transaction entry and bank statement reconciliation via CSV upload.

## ✨ Key Features

*   **Automatic Expense Tracking:** Parses emails from your Gmail inbox to identify and extract transaction details.
*   **Smart Categorization:** Automatically categorizes expenses based on merchant, email content, and customizable rules.
*   **Manual Entry:** Allows adding transactions manually if they are not captured from emails.
*   **Bank Statement Reconciliation:** Upload CSV bank statements to reconcile with tracked expenses and import missing data.
*   **Data Visualization:** Provides insightful charts and graphs for understanding spending patterns, category breakdowns, and monthly trends.
*   **Google OAuth Integration:** Securely connects to your Gmail account via Google OAuth for fetching emails.
*   **Monorepo Structure:** Organizes both backend (Node.js/Express) and frontend (React/Vite) applications within a single repository.

## 🚀 Tech Stack

*   **Backend:** Node.js, Express.js, Mongoose, Googleapis, Multer, CORS, dotenv, csv-parse
*   **Frontend:** React, Vite, CSS
*   **Database:** MongoDB
*   **Languages:** JavaScript, HTML, CSS, JSON

## 📦 Installation & Setup

This project is structured as a monorepo with separate `backend` and `frontend` directories.

### 1. Prerequisites

*   Node.js (v18+ recommended)
*   npm or Yarn
*   MongoDB (local instance or Atlas account)
*   Google Cloud Project with Gmail API enabled and OAuth 2.0 Client ID credentials.

### 2. Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create `.env` file:** Copy `.env.example` to `.env` and populate it with your MongoDB connection string and Google Cloud credentials:
    ```dotenv
    # backend/.env
    MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/spendflow?retryWrites=true&w=majority
    PORT=3001
    FRONTEND_URL=http://localhost:5173

    # Google OAuth Credentials (if not using the wizard)
    # GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
    # GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
    # GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/callback 
    ```
    *   **Note:** The `FRONTEND_URL` should match the address where your React app is running locally (usually `http://localhost:5173` for Vite).

4.  **Start the backend server in development mode:**
    ```bash
    npm run dev
    ```

### 3. Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd ../frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure API URL:** Ensure your `.env` file in the `frontend` directory points to your backend URL:
    ```dotenv
    # frontend/.env
    VITE_API_URL=http://localhost:3001
    ```
    (If you created a `.env` file in the root `frontend` directory, Vite should automatically pick it up).

4.  **Start the frontend development server:**
    ```bash
    npm run dev
    ```

### 4. Connecting Gmail

1.  Open the frontend application in your browser (usually `http://localhost:5173`).
2.  Click the **"Connect Gmail"** button on the dashboard.
3.  Follow the **"Setup Google OAuth Credentials"** wizard:
    *   Create a Google Cloud project and enable the **Gmail API**.
    *   Configure the **OAuth Consent Screen** (External user type, add your email as a test user).
    *   Create **Web Application Credentials** with the correct redirect URI (`http://localhost:3001/api/auth/callback`).
    *   Enter your `Client ID` and `Client Secret` into the wizard and save.
4.  Click **"Authenticate Account"** to initiate the Google sign-in flow.
5.  Grant the necessary permissions (read-only access to your Gmail).

## 💡 Usage

Once the backend and frontend are running and Gmail is connected:

1.  **Sync Inbox:** Click the **"Sync Inbox"** button to fetch and parse recent transaction emails.
2.  **View Transactions:** The **"Transaction Ledger"** will display all parsed expenses. You can filter by category, month, or search.
3.  **Edit Transactions:** Click on any transaction in the ledger to view details and manually edit its category.
4.  **Add Manually:** Use the **"Add Transaction"** button to log expenses not captured from emails.
5.  **Reconcile Bank Statement:** Use the **"Upload Bank Statement"** button to upload a CSV file from your bank. The application will match and reconcile entries, updating categories and adding new transactions.
6.  **Analytics:** Explore the **"Analytics & Financial Insights"** section for visual breakdowns of spending by category, merchant, and monthly trends.

## 🌐 API Reference (Backend Endpoints)

*   `GET /api/auth/status`: Check Gmail authentication status.
*   `POST /api/auth/credentials`: Save Google OAuth credentials.
*   `GET /api/auth/url`: Get the Google OAuth consent screen URL.
*   `GET /api/auth/callback`: OAuth callback route to handle token exchange.
*   `POST /api/auth/logout`: Log out and clear session tokens.
*   `GET /api/expenses`: Retrieve all synced expenses.
*   `POST /api/expenses`: Add a new manual expense.
*   `PUT /api/expenses/:id`: Update an existing expense (e.g., category).
*   `DELETE /api/expenses/:id`: Delete an expense.
*   `POST /api/sync`: Sync new transactions from Gmail.
*   `POST /api/upload-raw`: Parse and add expense from raw email content.
*   `POST /api/upload-statement`: Upload and reconcile a CSV bank statement.

## 📂 Project Structure

```
gmail-expense-tracker/
├── backend/             # Node.js backend application
│   ├── node_modules/
│   ├── data/
│   │   └── expenses.json   # Local expenses data (if used)
│   ├── db.js               # Mongoose models for Expense and Config
│   ├── gmail-client.js     # Google Gmail API interaction logic
│   ├── parser.js           # Email parsing and categorization logic
│   ├── server.js           # Express server setup and routes
│   ├── statement-parser.js # CSV statement parsing logic
│   ├── statement-reconcile.js # Statement reconciliation logic
│   ├── .env.example
│   ├── package.json
│   └── credentials.json    # Stores Google API credentials (optional)
│   └── token.json          # Stores Google OAuth tokens (optional)
│
├── frontend/           # React frontend application
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── App.css
│   │   ├── App.jsx         # Main React component
│   │   ├── index.css
│   │   └── main.jsx        # React entry point
│   ├── .env.example
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js      # Vite configuration
│
├── package.json        # Monorepo root package.json with common scripts
└── README.md           # This README file
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an Issue.

## 📄 License

This project is not explicitly licensed. Please refer to the original author for licensing details.

## 🔗 Important Links

*   **Live Demo:** (No live demo provided in the repository)
*   **Repository:** [mauryarahul007/gmail-expense-tracker](https://github.com/mauryarahul007/gmail-expense-tracker)

## 🚀 Project Footer

© 2026 **Gmail Expense Tracker** • [View Repository](https://github.com/mauryarahul007/gmail-expense-tracker) • Fork | Like | Star ⭐


---
**<p align="center">Generated by [ReadmeCodeGen](https://www.readmecodegen.com/)</p>**
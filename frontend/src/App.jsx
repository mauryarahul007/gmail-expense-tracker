import React, { useState, useEffect } from 'react';

// Static mock expenses for high-fidelity out-of-the-box demo
const DEMO_EXPENSES = [
  { id: 'demo-salary-1', date: '2026-06-01T09:00:00.000Z', amount: 150000, currency: 'INR', merchant: 'Salary Payout', category: 'Salary', subject: 'Salary Credited for June 2026', snippet: 'Your account XX424 has been credited with INR 150,000.00 towards Salary.', from: 'alerts@hdfcbank.net', bodySummary: 'Dear Customer, your HDFC bank account XX424 has been credited with INR 150,000.00 towards Salary Payout on 01-06-2026.' },
  { id: 'demo-salary-2', date: '2026-05-01T09:00:00.000Z', amount: 150000, currency: 'INR', merchant: 'Salary Payout', category: 'Salary', subject: 'Salary Credited for May 2026', snippet: 'Your account XX424 has been credited with INR 150,000.00 towards Salary.', from: 'alerts@hdfcbank.net', bodySummary: 'Dear Customer, your HDFC bank account XX424 has been credited with INR 150,000.00 towards Salary Payout on 01-05-2026.' },
  { id: 'demo-salary-3', date: '2026-04-01T09:00:00.000Z', amount: 150000, currency: 'INR', merchant: 'Salary Payout', category: 'Salary', subject: 'Salary Credited for April 2026', snippet: 'Your account XX424 has been credited with INR 150,000.00 towards Salary.', from: 'alerts@hdfcbank.net', bodySummary: 'Dear Customer, your HDFC bank account XX424 has been credited with INR 150,000.00 towards Salary Payout on 01-04-2026.' },
  { id: 'demo-1', date: '2026-06-04T12:30:00.000Z', amount: 450, currency: 'INR', merchant: 'Zomato', category: 'Food Delivery', subject: 'Your Zomato order #92837198 was delivered', snippet: 'Thanks for ordering! You spent Rs. 450.00 on Butter Chicken & Naan.', from: 'noreply@zomato.com', bodySummary: 'Hi Rahul,\nYour order from "Delhi Darbar" has been delivered. Total paid: Rs. 450.00 via UPI.' },
  { id: 'demo-rent-1', date: '2026-06-01T10:00:00.000Z', amount: 24000, currency: 'INR', merchant: 'House Rent', category: 'Rent', subject: 'Rent Transfer Confirmed - Landlord', snippet: 'Rent payment of Rs. 24,000.00 transferred successfully to landlord bank account.', from: 'alerts@hdfcbank.net', bodySummary: 'Dear Customer, your HDFC bank account has been debited with Rs. 24,000.00 for Rent transfer via NetBanking on 01-06-2026.' },
  { id: 'demo-2', date: '2026-06-03T18:45:00.000Z', amount: 2499, currency: 'INR', merchant: 'Amazon', category: 'Shopping', subject: 'Your Amazon.in order #408-29381-2938102 confirmed', snippet: 'Order total: Rs. 2,499.00. Your item will be delivered tomorrow.', from: 'auto-confirm@amazon.in', bodySummary: 'Thank you for shopping with us. We will send a confirmation when items ship.\nOrder Total: Rs. 2,499.00\nPayment: HDFC Credit Card' },
  { id: 'demo-3', date: '2026-06-02T09:15:00.000Z', amount: 320, currency: 'INR', merchant: 'Uber', category: 'Travel & Commute', subject: 'Your Tuesday morning ride with Uber', snippet: 'Total: Rs. 320.00. Thanks for riding, Rahul!', from: 'uber.india@uber.com', bodySummary: 'Here is your receipt for your ride from Indiranagar to Koramangala. Fare: Rs. 320.00' },
  { id: 'demo-4', date: '2026-06-01T10:00:00.000Z', amount: 5000, currency: 'INR', merchant: 'Groww Mutual Fund', category: 'Investment', subject: 'SIP Order Confirmed - HDFC Top 100', snippet: 'Your SIP installment of Rs. 5,000.00 has been successfully invested.', from: 'support@groww.in', bodySummary: 'Dear Rahul, your SIP order for HDFC Top 100 Fund has been processed. Units will be allocated in 2 working days.' },
  { id: 'demo-5', date: '2026-05-28T16:20:00.000Z', amount: 14200, currency: 'INR', merchant: 'HDFC Credit Card', category: 'Credit Card', subject: 'Payment Received for HDFC Credit Card', snippet: 'We have received payment of Rs. 14,200.00 towards your credit card bill.', from: 'alerts@hdfcbank.net', bodySummary: 'Thank you for making payment of Rs. 14,200.00 towards HDFC Bank Credit Card ending in 4920 on 28-05-2026.' },
  { id: 'demo-rent-2', date: '2026-05-01T10:00:00.000Z', amount: 24000, currency: 'INR', merchant: 'House Rent', category: 'Rent', subject: 'Rent Transfer Confirmed - Landlord', snippet: 'Rent payment of Rs. 24,000.00 transferred successfully to landlord bank account.', from: 'alerts@hdfcbank.net', bodySummary: 'Dear Customer, your HDFC bank account has been debited with Rs. 24,000.00 for Rent transfer via NetBanking on 01-05-2026.' },
  { id: 'demo-6', date: '2026-05-27T12:05:00.000Z', amount: 80, currency: 'INR', merchant: 'Chai Tapri', category: 'UPI Payment', subject: 'UPI transaction of Rs. 80.00 successful', snippet: 'Money sent to chaitapri@ybl. UPI Ref: 62819201928.', from: 'gpay-alerts@google.com', bodySummary: 'You have paid Rs. 80.00 via Google Pay to Chai Tapri (UPI ID: chaitapri@ybl) on May 27, 2026.' },
  { id: 'demo-7', date: '2026-05-25T15:20:00.000Z', amount: 2400, currency: 'INR', merchant: 'BESCOM Electricity', category: 'Utilities & Bills', subject: 'Electricity Bill Payment Confirmation', snippet: 'Thank you for your payment of Rs. 2,400.00 to BESCOM online.', from: 'payments@bescom.co.in', bodySummary: 'Dear consumer, payment of Rs. 2,400.00 has been successfully credited to account 92837102 on 2026-05-25.' },
  { id: 'demo-8', date: '2026-05-24T21:10:00.000Z', amount: 799, currency: 'INR', merchant: 'Swiggy', category: 'Food Delivery', subject: 'Swiggy Order Receipt #82739182', snippet: 'Order delivered. Total Amount Paid: Rs. 799.00 via NetBanking.', from: 'orders@swiggy.in', bodySummary: 'Thank you for ordering Swiggy. Items: Double Cheese Pizza & Coke. Total: Rs. 799.00' },
  { id: 'demo-9', date: '2026-05-18T14:30:00.000Z', amount: 15.49, currency: 'USD', merchant: 'Netflix', category: 'Subscriptions & Entertainment', subject: 'Netflix Subscription Receipt', snippet: 'Charged: $15.49 USD. Thanks for being a member!', from: 'billing@netflix.com', bodySummary: 'Your monthly streaming subscription renewed. Amount: $15.49 USD.' },
  { id: 'demo-10', date: '2026-05-10T19:30:00.000Z', amount: 350, currency: 'INR', merchant: 'Starbucks Coffee', category: 'Dining Out', subject: 'Your receipt from Starbucks Indiranagar', snippet: 'Total paid: Rs. 350.00. Payment: UPI.', from: 'receipts@starbucks.co.in', bodySummary: 'Thank you for visiting Starbucks Coffee. Item: 1x Java Chip Frappuccino. Paid: Rs. 350.00' },
  { id: 'demo-rent-3', date: '2026-04-01T10:00:00.000Z', amount: 24000, currency: 'INR', merchant: 'House Rent', category: 'Rent', subject: 'Rent Transfer Confirmed - Landlord', snippet: 'Rent payment of Rs. 24,000.00 transferred successfully to landlord bank account.', from: 'alerts@hdfcbank.net', bodySummary: 'Dear Customer, your HDFC bank account has been debited with Rs. 24,000.00 for Rent transfer via NetBanking on 01-04-2026.' },
  { id: 'demo-11', date: '2026-05-08T09:00:00.000Z', amount: 8000, currency: 'INR', merchant: 'ETMoney', category: 'Investment', subject: 'ETMONEY Mutual Fund Purchase Successful', snippet: 'Order executed: Rs. 8,000.00 invested in ICICI Prudential Bluechip Fund.', from: 'noreply@etmoney.com', bodySummary: 'Congratulations! Your payment of Rs. 8,000.00 has been received. We have sent request to AMC for units allotment.' },
  { id: 'demo-12', date: '2026-05-05T11:00:00.000Z', amount: 4000, currency: 'INR', merchant: 'Coin', category: 'Investment', subject: 'Coin ETF SIP Order Processed', snippet: 'Your SIP order of Rs. 4,000.00 for Nifty 50 BeES ETF was processed successfully.', from: 'support@zerodha.com', bodySummary: 'Dear Client, your SIP order for 15 units of Nifty BeES via Zerodha Coin is executed. Average price: Rs. 266.60. Total: Rs. 4,000.00' },
  { id: 'demo-13', date: '2026-05-02T10:15:00.000Z', amount: 15000, currency: 'INR', merchant: 'NPS', category: 'Investment', subject: 'National Pension System - Tier I Contribution Receipt', snippet: 'PRAN ending 1029. Contribution received: Rs. 15,000.00.', from: 'donotreply@cra-nsdl.com', bodySummary: 'Dear Subscriber, your Tier I account has been credited with Rs. 15,000.00 (exclusive of charges) on 02-05-2026.' },
  { id: 'demo-14', date: '2026-04-20T14:45:00.000Z', amount: 20000, currency: 'INR', merchant: 'PPF', category: 'Investment', subject: 'SBI PPF Account Transfer Alert', snippet: 'PPF A/c xxxx1928 credited with Rs. 20,000.00 from SB account.', from: 'notify@sbi.co.in', bodySummary: 'Dear Customer, your Public Provident Fund account has been credited with Rs. 20,000.00 via online auto-sweep transfer.' },
  { id: 'demo-15', date: '2026-04-15T19:30:00.000Z', amount: 1499, currency: 'INR', merchant: 'Steam Games', category: 'Subscriptions & Entertainment', subject: 'Thank you for your Steam Purchase!', from: 'noreply@steampowered.com', bodySummary: 'Your purchase of "Hades II" is confirmed. Total: Rs. 1,499.00 charged to Steam Wallet.' },
  { id: 'demo-16', date: '2026-03-24T20:30:00.000Z', amount: 550, currency: 'INR', merchant: 'Swiggy', category: 'Food Delivery', subject: 'Swiggy Order Receipt #817263', snippet: 'Delivered. Total Amount Paid: Rs. 550.00', from: 'orders@swiggy.in', bodySummary: ' Swiggy order confirmation. Total: Rs. 550.00' }
];

export default function App() {
  const [dataSource, setDataSource] = useState('demo'); // 'demo' or 'live'
  const [expenses, setExpenses] = useState(DEMO_EXPENSES);
  const [isLoading, setIsLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Auth fields
  const [authStatus, setAuthStatus] = useState({ hasCredentials: false, isAuthenticated: false });
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  // Filters
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterMonth, setFilterMonth] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Analytics Tab
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState('split');

  // Manual upload form
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [rawSubject, setRawSubject] = useState('');
  const [rawBody, setRawBody] = useState('');
  const [rawDate, setRawDate] = useState(new Date().toISOString().substring(0, 10));

  // Bank Statement upload
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [statementFile, setStatementFile] = useState(null);
  const [statementUploading, setStatementUploading] = useState(false);
  const [statementResult, setStatementResult] = useState(null);

  // Add Manual Transaction form
  const [showAddManualModal, setShowAddManualModal] = useState(false);
  const [manualMerchant, setManualMerchant] = useState('');
  const [manualAmount, setManualAmount] = useState('');
  const [manualCurrency, setManualCurrency] = useState('INR');
  const [manualDate, setManualDate] = useState(new Date().toISOString().substring(0, 10));
  const [manualCategory, setManualCategory] = useState('Other');
  const [manualNotes, setManualNotes] = useState('');

  const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Check auth status & read live data if available
  useEffect(() => {
    checkAuthStatus();
    
    // Check if redirecting back after OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      setDataSource('live');
      // Clean query parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchLiveExpenses();
    }
  }, []);

  useEffect(() => {
    if (dataSource === 'live') {
      fetchLiveExpenses();
      checkAuthStatus();
    } else {
      setExpenses(DEMO_EXPENSES);
    }
  }, [dataSource]);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/status`);
      if (res.ok) {
        const data = await res.json();
        setAuthStatus(data);
        if (data.isAuthenticated && dataSource === 'demo') {
          // Auto switch to live if authenticated
          setDataSource('live');
        }
      }
    } catch (err) {
      console.warn('Backend server is not running or unreachable.', err.message);
    }
  };

  const fetchLiveExpenses = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/expenses`);
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (err) {
      console.error('Error fetching live expenses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCredentials = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: `http://localhost:3001/api/auth/callback`
        })
      });

      if (res.ok) {
        alert('Credentials configuration saved!');
        setShowSetupWizard(false);
        checkAuthStatus();
      } else {
        const data = await res.json();
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Could not connect to backend server. Make sure it is running on port 3001.');
    }
  };

  const startOAuthFlow = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/url`);
      if (res.ok) {
        const data = await res.json();
        // Redirect browser to google oauth
        window.location.href = data.url;
      } else {
        const data = await res.json();
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Auth flow trigger failed.');
    }
  };

  const syncGmail = async () => {
    if (!authStatus.isAuthenticated) {
      alert('Please connect your Gmail account first.');
      return;
    }
    setSyncing(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 1000 })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Sync Complete! Added ${data.addedCount} new transaction email(s).`);
        fetchLiveExpenses();
      } else {
        alert('Sync error: ' + data.error);
      }
    } catch (err) {
      alert('Connection error during sync.');
    } finally {
      setSyncing(false);
    }
  };

  const logout = async () => {
    if (window.confirm('Disconnect Gmail integration? This will remove session tokens.')) {
      try {
        await fetch(`${BACKEND_URL}/api/auth/logout`, { method: 'POST' });
        setDataSource('demo');
        setExpenses(DEMO_EXPENSES);
        checkAuthStatus();
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
  };

  const deleteExpense = async (id) => {
    if (dataSource === 'demo') {
      alert('Cannot modify or delete demo data.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/expenses/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          fetchLiveExpenses();
          setSelectedExpense(null);
        }
      } catch (err) {
        alert('Failed to delete expense.');
      }
    }
  };

  const updateCategory = async (id, newCategory) => {
    if (dataSource === 'demo') {
      alert('Cannot modify category in demo data.');
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory })
      });
      if (res.ok) {
        fetchLiveExpenses();
        // Update local views
        if (selectedExpense && selectedExpense.id === id) {
          setSelectedExpense(prev => ({ ...prev, category: newCategory }));
        }
        setEditingExpense(null);
      }
    } catch (err) {
      alert('Failed to update category.');
    }
  };

  const handleRawUpload = async (e) => {
    e.preventDefault();
    if (dataSource === 'demo') {
      alert('Please switch to "Live Workspace / Local database" data source first.');
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/upload-raw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: rawSubject,
          body: rawBody,
          date: new Date(rawDate).toISOString(),
          snippet: rawBody.substring(0, 150)
        })
      });

      if (res.ok) {
        alert('Email content parsed and expense recorded!');
        setShowUploadModal(false);
        setRawSubject('');
        setRawBody('');
        fetchLiveExpenses();
      } else {
        const data = await res.json();
        alert('Parsing failed: ' + data.error);
      }
    } catch (err) {
      alert('Failed to connect to backend for manual parser.');
    }
  };

  const handleAddManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualMerchant || !manualAmount || !manualDate) {
      alert('Merchant, Amount and Date are required.');
      return;
    }
    const parsedAmount = Number(manualAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid positive amount.');
      return;
    }

    if (dataSource === 'demo') {
      const mockId = 'demo-manual-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      const newExpense = {
        id: mockId,
        date: new Date(manualDate).toISOString(),
        amount: parsedAmount,
        currency: manualCurrency,
        merchant: manualMerchant,
        category: manualCategory,
        subject: 'Manual Transaction',
        snippet: manualNotes || '',
        from: 'Manual Entry',
        bodySummary: manualNotes || ''
      };
      setExpenses(prev => [newExpense, ...prev]);
      alert('Transaction added successfully (Demo Mode)!');
      setShowAddManualModal(false);
      resetManualForm();
    } else {
      try {
        const res = await fetch(`${BACKEND_URL}/api/expenses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: new Date(manualDate).toISOString(),
            amount: parsedAmount,
            currency: manualCurrency,
            merchant: manualMerchant,
            category: manualCategory,
            snippet: manualNotes
          })
        });

        if (res.ok) {
          alert('Transaction added successfully!');
          setShowAddManualModal(false);
          resetManualForm();
          fetchLiveExpenses();
        } else {
          const data = await res.json();
          alert('Failed to add transaction: ' + data.error);
        }
      } catch (err) {
        alert('Failed to connect to backend.');
      }
    }
  };

  const resetManualForm = () => {
    setManualMerchant('');
    setManualAmount('');
    setManualCurrency('INR');
    setManualDate(new Date().toISOString().substring(0, 10));
    setManualCategory('Other');
    setManualNotes('');
  };

  const handleStatementUpload = async (e) => {
    e.preventDefault();
    if (!statementFile) {
      alert('Please select a CSV file first.');
      return;
    }
    if (dataSource === 'demo') {
      alert('Please switch to "Live Workspace / Local DB" before uploading a bank statement.');
      return;
    }
    setStatementUploading(true);
    setStatementResult(null);
    try {
      const formData = new FormData();
      formData.append('statement', statementFile);
      const res = await fetch(`${BACKEND_URL}/api/upload-statement`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatementResult(data);
        fetchLiveExpenses();
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Could not connect to backend: ' + err.message);
    } finally {
      setStatementUploading(false);
    }
  };

  // --- Filtering & Stat Calculations ---

  // Hardcode exchange rate for presentation purposes: 1 USD = 83 INR
  const getAmountInINR = (exp) => {
    if (!exp) return 0;
    const amount = typeof exp.amount === 'number' ? exp.amount : 0;
    const currency = exp.currency || 'INR';
    if (currency === 'INR') return amount;
    if (currency === 'USD') return amount * 83;
    return amount;
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Get months list available in data
  const months = ['All', ...new Set(expenses.map(e => {
    if (!e || !e.date) return 'Unknown Month';
    const d = new Date(e.date);
    if (isNaN(d.getTime())) return 'Unknown Month';
    return d.toLocaleString('en-US', { month: 'long', year: 'numeric' }); // explicitly en-US for consistent parsing/filtering
  }))].filter(m => m !== 'Unknown Month');

  // Apply filters to dataset
  const filteredExpenses = expenses.filter(e => {
    if (!e) return false;
    const category = e.category || 'Other';
    const matchCategory = filterCategory === 'All' || category === filterCategory;
    
    let mStr = 'Unknown Month';
    if (e.date) {
      const d = new Date(e.date);
      if (!isNaN(d.getTime())) {
        mStr = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      }
    }
    const matchMonth = filterMonth === 'All' || mStr === filterMonth;

    const merchant = e.merchant || 'Unknown Merchant';
    const subject = e.subject || '';
    const snippet = e.snippet || '';

    const query = searchQuery.toLowerCase();
    const matchSearch = merchant.toLowerCase().includes(query) || 
                        subject.toLowerCase().includes(query) || 
                        snippet.toLowerCase().includes(query);

    return matchCategory && matchMonth && matchSearch;
  });

  // Calculate overall statistics
  const expenseOnlyFiltered = filteredExpenses.filter(e => e.category !== 'Salary');
  const salaryOnlyFiltered = filteredExpenses.filter(e => e.category === 'Salary');

  const totalSpend = expenseOnlyFiltered.reduce((sum, e) => sum + getAmountInINR(e), 0);
  const transactionCount = expenseOnlyFiltered.length;
  
  // Calculate average expense
  const averageSpend = transactionCount > 0 ? totalSpend / transactionCount : 0;

  // Calculate total salary received
  const totalSalaryReceived = salaryOnlyFiltered.reduce((sum, e) => sum + getAmountInINR(e), 0);

  // Calculate category totals
  const categoryData = expenseOnlyFiltered.reduce((acc, e) => {
    if (!e) return acc;
    const category = e.category || 'Other';
    const inrVal = getAmountInINR(e);
    acc[category] = (acc[category] || 0) + inrVal;
    return acc;
  }, {});

  const categoryBreakdown = Object.entries(categoryData).map(([name, amount]) => ({
    name,
    amount,
    percentage: totalSpend > 0 ? Math.round((amount / totalSpend) * 100) : 0
  })).sort((a, b) => b.amount - a.amount);

  // Calculate monthly trend data (for the bar chart - last 6 months or whatever exists in filtered data)
  const monthlyTotalsMap = expenses.reduce((acc, e) => {
    if (!e || !e.date || e.category === 'Salary') return acc;
    const d = new Date(e.date);
    if (isNaN(d.getTime())) return acc;
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-11
    const key = `${year}-${String(month + 1).padStart(2, '0')}`; // "2026-05"
    const inrVal = getAmountInINR(e);
    acc[key] = (acc[key] || 0) + inrVal;
    return acc;
  }, {});

  // Get sorted unique months from data (limit to last 6)
  const monthlyTrendData = Object.entries(monthlyTotalsMap)
    .map(([key, total]) => {
      const [year, monthStr] = key.split('-');
      const d = new Date(parseInt(year), parseInt(monthStr) - 1, 1);
      const label = d.toLocaleString('en-US', { month: 'short' }) + ' ' + year.substring(2);
      return { key, label, total };
    })
    .sort((a, b) => a.key.localeCompare(b.key))
    .slice(-6);

  const maxMonthlyVal = Math.max(...monthlyTrendData.map(m => m.total), 1000);

  // --- Advanced Analytics Calculations ---
  // 1. Fixed vs Discretionary Split
  const FIXED_CATEGORIES = ['Rent', 'Investment', 'Subscriptions & Entertainment', 'Utilities & Bills', 'Credit Card'];
  let fixedSpend = 0;
  let discretionarySpend = 0;
  expenseOnlyFiltered.forEach(e => {
    const amount = getAmountInINR(e);
    if (FIXED_CATEGORIES.includes(e.category)) {
      fixedSpend += amount;
    } else {
      discretionarySpend += amount;
    }
  });
  const totalSplitSpend = fixedSpend + discretionarySpend;
  const fixedPercentage = totalSplitSpend > 0 ? Math.round((fixedSpend / totalSplitSpend) * 100) : 0;
  const discretionaryPercentage = totalSplitSpend > 0 ? Math.round((discretionarySpend / totalSplitSpend) * 100) : 0;

  // 2. Top Merchants Bubble Chart
  const merchantTotals = expenseOnlyFiltered.reduce((acc, e) => {
    if (!e) return acc;
    const name = e.merchant || 'Unknown Merchant';
    const inrVal = getAmountInINR(e);
    if (!acc[name]) {
      acc[name] = { name, amount: 0, count: 0 };
    }
    acc[name].amount += inrVal;
    acc[name].count += 1;
    return acc;
  }, {});
  const topMerchants = Object.values(merchantTotals)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6);
  const maxMerchantAmount = topMerchants.length > 0 ? topMerchants[0].amount : 1;

  // 3. Day of Week Spending Heatmap
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeekSpends = Array(7).fill(0).map((_, idx) => ({ dayName: DAY_NAMES[idx], total: 0, count: 0 }));
  expenseOnlyFiltered.forEach(e => {
    if (!e || !e.date) return;
    const d = new Date(e.date);
    if (isNaN(d.getTime())) return;
    const dayIdx = d.getDay();
    const val = getAmountInINR(e);
    dayOfWeekSpends[dayIdx].total += val;
    dayOfWeekSpends[dayIdx].count += 1;
  });
  const maxDaySpend = Math.max(...dayOfWeekSpends.map(d => d.total), 1);

  // 4. Subscription & Billing Calendar (scan entire expenses database for regular recurring entries)
  const RECURRING_CATEGORIES = ['Rent', 'Subscriptions & Entertainment', 'Utilities & Bills'];
  const recurringMap = expenses.reduce((acc, e) => {
    if (!e || !RECURRING_CATEGORIES.includes(e.category)) return acc;
    const merchant = e.merchant || 'Unknown';
    if (!acc[merchant]) {
      acc[merchant] = {
        merchant,
        category: e.category,
        amount: getAmountInINR(e),
        dates: [],
        latestDate: new Date(e.date)
      };
    }
    acc[merchant].dates.push(new Date(e.date));
    if (new Date(e.date) > acc[merchant].latestDate) {
      acc[merchant].latestDate = new Date(e.date);
      acc[merchant].amount = getAmountInINR(e);
    }
    return acc;
  }, {});

  const billingCalendar = Object.values(recurringMap).map(item => {
    const billingDay = item.latestDate.getDate();
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    let targetDate = new Date(currentYear, currentMonth, billingDay);
    if (targetDate < today) {
      targetDate = new Date(currentYear, currentMonth + 1, billingDay);
    }
    
    const diffTime = Math.abs(targetDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      ...item,
      billingDay,
      daysRemaining: diffDays,
      targetDate
    };
  }).sort((a, b) => a.daysRemaining - b.daysRemaining);

  // 5. MoM Stacked Trends (comparing category shares across top 6 months)
  const trendMonths = monthlyTrendData.map(m => m.key);
  const categoryTrendData = trendMonths.map(mKey => {
    const monthExpenses = expenses.filter(e => {
      if (!e || !e.date) return false;
      const d = new Date(e.date);
      if (isNaN(d.getTime())) return false;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return key === mKey;
    });
    
    const totals = { Rent: 0, Investment: 0, Food: 0, Shopping: 0, Other: 0 };
    monthExpenses.forEach(e => {
      const amount = getAmountInINR(e);
      if (e.category === 'Rent') totals.Rent += amount;
      else if (e.category === 'Investment') totals.Investment += amount;
      else if (e.category === 'Food Delivery' || e.category === 'Dining Out') totals.Food += amount;
      else if (e.category === 'Shopping') totals.Shopping += amount;
      else if (e.category !== 'Salary') totals.Other += amount;
    });
    
    const totalMonthSpend = Object.values(totals).reduce((sum, v) => sum + v, 0);
    return {
      monthKey: mKey,
      label: new Date(parseInt(mKey.split('-')[0]), parseInt(mKey.split('-')[1]) - 1, 1).toLocaleString('en-US', { month: 'short' }) + ' ' + mKey.split('-')[0].substring(2),
      totals,
      totalMonthSpend
    };
  });

  // Calculate salary trend data for monthly trends
  const salaryTrendData = trendMonths.map(mKey => {
    const monthExpenses = expenses.filter(e => {
      if (!e || !e.date) return false;
      const d = new Date(e.date);
      if (isNaN(d.getTime())) return false;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return key === mKey;
    });

    let salaryAmount = 0;
    monthExpenses.forEach(e => {
      if (e.category === 'Salary') {
        salaryAmount += getAmountInINR(e);
      }
    });

    return {
      monthKey: mKey,
      label: new Date(parseInt(mKey.split('-')[0]), parseInt(mKey.split('-')[1]) - 1, 1).toLocaleString('en-US', { month: 'short' }) + ' ' + mKey.split('-')[0].substring(2),
      amount: salaryAmount
    };
  });

  return (
    <>
      {/* Navbar */}
      <header className="navbar">
        <div className="container navbar-content">
          <div className="logo-group">
            <div className="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <span className="logo-text">SpendFlow</span>
          </div>

          <div className="nav-actions">
            {/* Data Source Selector */}
            <select 
              className="filter-select"
              value={dataSource}
              onChange={(e) => setDataSource(e.target.value)}
              style={{ fontWeight: 600 }}
            >
              <option value="demo">✨ Demo Sandbox</option>
              <option value="live">📁 Live Workspace / Local DB</option>
            </select>

            {dataSource === 'live' && (
              <>
                {authStatus.isAuthenticated ? (
                  <>
                    <button className="btn btn-primary" onClick={syncGmail} disabled={syncing}>
                      <svg className={syncing ? 'rotating' : ''} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                      </svg>
                      {syncing ? 'Syncing Gmail...' : 'Sync Inbox'}
                    </button>
                    <button className="btn btn-secondary" onClick={logout}>
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button className="btn btn-primary" onClick={() => setShowSetupWizard(true)}>
                    🔌 Connect Gmail
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="container">
          
          {/* Welcome Screen & Setup Banner */}
          <div className="welcome-section">
            <div>
              <h1 className="welcome-title">Gmail Expense Analyzer</h1>
              <p className="welcome-subtitle">
                {dataSource === 'demo' 
                  ? 'Showing high-fidelity sandbox data. Switch to Live Workspace to sync with your actual Gmail account.'
                  : 'Displaying expenses synced from your connected Gmail mailbox.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {dataSource === 'live' && (
                <button className="btn btn-secondary" onClick={() => setShowUploadModal(true)}>
                  📥 Parse EML Content
                </button>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => { setStatementResult(null); setStatementFile(null); setShowStatementModal(true); }}
                style={{ borderColor: 'var(--green)', color: 'var(--green)' }}
              >
                🏦 Upload Bank Statement
              </button>
              <button className="btn btn-primary" onClick={() => setShowAddManualModal(true)}>
                ➕ Add Transaction
              </button>
            </div>
          </div>

          {/* Month Navigation Tab System */}
          <div className="month-tabs-container">
            {months.map(m => (
              <button 
                key={m} 
                className={`month-tab ${filterMonth === m ? 'active' : ''}`}
                onClick={() => setFilterMonth(m)}
              >
                {m === 'All' ? '📅 All Time' : m}
              </button>
            ))}
          </div>

          {/* Metric Cards Grid */}
          <div className="metrics-grid">
            <div className="metric-card purple">
              <div className="metric-header">
                <span className="metric-label">Total Outflow</span>
                <div className="metric-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4M12 16V8"/>
                  </svg>
                </div>
              </div>
              <h2 className="metric-value">{formatCurrency(totalSpend)}</h2>
              <span className="metric-subtext">Across {transactionCount} payments</span>
            </div>

            <div className="metric-card emerald">
              <div className="metric-header">
                <span className="metric-label">Salary Received</span>
                <div className="metric-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>
                  </svg>
                </div>
              </div>
              <h2 className="metric-value" style={{ color: '#22c55e' }}>{formatCurrency(totalSalaryReceived)}</h2>
              <span className="metric-subtext">Total monthly income</span>
            </div>

            <div className="metric-card blue">
              <div className="metric-header">
                <span className="metric-label">Average Transaction</span>
                <div className="metric-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20v-6M6 20V10M18 20V4"/>
                  </svg>
                </div>
              </div>
              <h2 className="metric-value">{formatCurrency(averageSpend)}</h2>
              <span className="metric-subtext">Single expense average</span>
            </div>

            <div className="metric-card green">
              <div className="metric-header">
                <span className="metric-label">Primary Category</span>
                <div className="metric-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01"/>
                  </svg>
                </div>
              </div>
              <h2 className="metric-value" style={{ fontSize: '22px', paddingTop: '6px' }}>
                {categoryBreakdown[0] ? categoryBreakdown[0].name : 'None'}
              </h2>
              <span className="metric-subtext">
                {categoryBreakdown[0] ? `${formatCurrency(categoryBreakdown[0].amount)} spent` : 'No transactions'}
              </span>
            </div>

            <div className="metric-card orange">
              <div className="metric-header">
                <span className="metric-label">Integration Status</span>
                <div className="metric-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
              <h2 className="metric-value" style={{ fontSize: '22px', paddingTop: '6px' }}>
                {dataSource === 'demo' ? 'Sandbox' : (authStatus.isAuthenticated ? 'Live Gmail' : 'Config Required')}
              </h2>
              <span className="metric-subtext">
                {dataSource === 'demo' ? 'Mock Data Active' : (authStatus.isAuthenticated ? 'Authenticated & Ready' : 'OAuth Credentials Needed')}
              </span>
            </div>
          </div>

          {/* Analytics & Insights Section */}
          <div className="panel-card" style={{ marginBottom: '32px' }}>
            <div className="panel-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="panel-title">📊 Analytics & Financial Insights</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Interactive Infographics</span>
              </div>
              
              {/* Tabs navigation */}
              <div className="analytics-tabs-container" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                <button 
                  type="button"
                  className={`analytics-tab ${activeAnalyticsTab === 'split' ? 'active' : ''}`}
                  onClick={() => setActiveAnalyticsTab('split')}
                >
                  🍩 Fixed vs. Discretionary
                </button>
                <button 
                  type="button"
                  className={`analytics-tab ${activeAnalyticsTab === 'merchants' ? 'active' : ''}`}
                  onClick={() => setActiveAnalyticsTab('merchants')}
                >
                  🫧 Top Merchants
                </button>
                <button 
                  type="button"
                  className={`analytics-tab ${activeAnalyticsTab === 'heatmap' ? 'active' : ''}`}
                  onClick={() => setActiveAnalyticsTab('heatmap')}
                >
                  📅 Day-of-Week Heatmap
                </button>
                <button 
                  type="button"
                  className={`analytics-tab ${activeAnalyticsTab === 'calendar' ? 'active' : ''}`}
                  onClick={() => setActiveAnalyticsTab('calendar')}
                >
                  🔔 Billing Calendar
                </button>
                <button 
                  type="button"
                  className={`analytics-tab ${activeAnalyticsTab === 'trends' ? 'active' : ''}`}
                  onClick={() => setActiveAnalyticsTab('trends')}
                >
                  📈 Stacked Category Trend
                </button>
                <button 
                  type="button"
                  className={`analytics-tab ${activeAnalyticsTab === 'salary' ? 'active' : ''}`}
                  onClick={() => setActiveAnalyticsTab('salary')}
                >
                  💵 Salary History
                </button>
              </div>
            </div>

            {/* TAB CONTENTS */}
            <div className="analytics-tab-content" style={{ minHeight: '220px' }}>
              
              {/* Tab 1: Fixed vs. Discretionary Donut Chart */}
              {activeAnalyticsTab === 'split' && (
                <div className="analytics-split-layout">
                  {totalSplitSpend === 0 ? (
                    <div className="empty-state">No transaction data available for this view.</div>
                  ) : (
                    <>
                      {/* SVG Donut */}
                      <div className="donut-chart-container">
                        <svg width="180" height="180" viewBox="0 0 180 180" className="donut-svg">
                          {/* Discretionary segment (base background/first segment) */}
                          <circle 
                            cx="90" 
                            cy="90" 
                            r="70" 
                            fill="transparent" 
                            stroke="rgba(96, 165, 250, 0.15)" 
                            strokeWidth="20"
                          />
                          {/* Discretionary active track */}
                          <circle 
                            cx="90" 
                            cy="90" 
                            r="70" 
                            fill="transparent" 
                            stroke="var(--blue)" 
                            strokeWidth="20"
                            strokeDasharray={`${2 * Math.PI * 70}`}
                            strokeDashoffset={`${2 * Math.PI * 70 * (1 - discretionaryPercentage / 100)}`}
                            strokeLinecap="round"
                            transform="rotate(-90 90 90)"
                            style={{ filter: 'drop-shadow(0 0 6px var(--blue-glow))', transition: 'stroke-dashoffset 0.8s ease' }}
                          />
                          {/* Fixed active track */}
                          <circle 
                            cx="90" 
                            cy="90" 
                            r="70" 
                            fill="transparent" 
                            stroke="var(--purple)" 
                            strokeWidth="20"
                            strokeDasharray={`${2 * Math.PI * 70}`}
                            strokeDashoffset={`${2 * Math.PI * 70 * (1 - fixedPercentage / 100)}`}
                            strokeLinecap="round"
                            transform={`rotate(${(discretionaryPercentage / 100) * 360 - 90} 90 90)`}
                            style={{ filter: 'drop-shadow(0 0 6px var(--purple-glow))', transition: 'stroke-dashoffset 0.8s ease' }}
                          />
                          {/* Center Text */}
                          <text x="90" y="85" textAnchor="middle" dominantBaseline="middle" fill="var(--text-primary)" fontSize="18" fontWeight="800">
                            {fixedPercentage}%
                          </text>
                          <text x="90" y="105" textAnchor="middle" dominantBaseline="middle" fill="var(--text-secondary)" fontSize="11" fontWeight="600" letterSpacing="0.5">
                            FIXED
                          </text>
                        </svg>
                      </div>

                      {/* Legend Stats */}
                      <div className="donut-legend-container">
                        <div className="legend-item purple">
                          <div className="legend-color-box" style={{ backgroundColor: 'var(--purple)', boxShadow: '0 0 10px var(--purple)' }}></div>
                          <div className="legend-text-details">
                            <span className="legend-label">Fixed Expenses & Savings</span>
                            <h4 className="legend-value">{formatCurrency(fixedSpend)} <span className="legend-percentage">({fixedPercentage}%)</span></h4>
                            <p className="legend-description">Rent, SIP Investments, Utility Bills, Cards & Subscriptions</p>
                          </div>
                        </div>

                        <div className="legend-item blue" style={{ marginTop: '20px' }}>
                          <div className="legend-color-box" style={{ backgroundColor: 'var(--blue)', boxShadow: '0 0 10px var(--blue)' }}></div>
                          <div className="legend-text-details">
                            <span className="legend-label">Discretionary Spend</span>
                            <h4 className="legend-value">{formatCurrency(discretionarySpend)} <span className="legend-percentage">({discretionaryPercentage}%)</span></h4>
                            <p className="legend-description">Food Delivery, Dining Out, Shopping, Commutes & UPI transfers</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Tab 2: Top Merchants Spend (Bubbles View) */}
              {activeAnalyticsTab === 'merchants' && (
                <div className="analytics-merchants-layout">
                  {topMerchants.length === 0 ? (
                    <div className="empty-state">No merchants found. Try syncing your Gmail inbox.</div>
                  ) : (
                    <div className="merchants-bubble-grid">
                      {topMerchants.map((m, idx) => {
                        const size = Math.max(100, Math.round(100 + (m.amount / maxMerchantAmount) * 60));
                        const colors = [
                          { bg: 'var(--purple-glow)', border: 'var(--purple)', color: 'var(--purple)' },
                          { bg: 'var(--blue-glow)', border: 'var(--blue)', color: 'var(--blue)' },
                          { bg: 'var(--green-glow)', border: 'var(--green)', color: 'var(--green)' },
                          { bg: 'var(--orange-glow)', border: 'var(--orange)', color: 'var(--orange)' },
                          { bg: 'rgba(236, 72, 153, 0.15)', border: '#ec4899', color: '#ec4899' },
                          { bg: 'rgba(6, 182, 212, 0.15)', border: '#06b6d4', color: '#06b6d4' }
                        ];
                        const scheme = colors[idx % colors.length];

                        return (
                          <div 
                            key={m.name} 
                            className="merchant-bubble-card"
                            style={{ 
                              width: `${size}px`, 
                              height: `${size}px`, 
                              backgroundColor: scheme.bg, 
                              borderColor: scheme.border,
                              color: scheme.color,
                              boxShadow: `0 0 15px ${scheme.bg}`
                            }}
                          >
                            <div className="bubble-avatar">
                              {m.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="bubble-name">{m.name}</span>
                            <span className="bubble-amount">{formatCurrency(m.amount)}</span>
                            <span className="bubble-count">{m.count} tx</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Day-of-Week Spending Heatmap */}
              {activeAnalyticsTab === 'heatmap' && (
                <div className="analytics-heatmap-layout">
                  <p className="helper-text" style={{ marginBottom: '16px', textAlign: 'center' }}>
                    Visualizes aggregate outflow intensity based on the day of the week. Darker colors signify higher spending.
                  </p>
                  <div className="heatmap-row-container">
                    {dayOfWeekSpends.map((day) => {
                      const ratio = maxDaySpend > 0 ? day.total / maxDaySpend : 0;
                      const opacity = Math.max(0.1, ratio);
                      const bgStyle = {
                        backgroundColor: `rgba(167, 139, 250, ${opacity})`,
                        border: `1px solid rgba(167, 139, 250, ${opacity + 0.15})`,
                        boxShadow: ratio > 0.5 ? `0 0 12px rgba(167, 139, 250, ${ratio * 0.3})` : 'none'
                      };

                      return (
                        <div key={day.dayName} className="heatmap-day-column" style={bgStyle}>
                          <span className="heatmap-day-name">{day.dayName.substring(0, 3)}</span>
                          <span className="heatmap-day-value">{formatCurrency(day.total)}</span>
                          <span className="heatmap-day-count">{day.count} payments</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 4: Subscription & Billing Calendar */}
              {activeAnalyticsTab === 'calendar' && (
                <div className="analytics-calendar-layout">
                  {billingCalendar.length === 0 ? (
                    <div className="empty-state">No recurring subscriptions or bill alerts found in data.</div>
                  ) : (
                    <div className="calendar-timeline-grid">
                      {billingCalendar.map((item) => {
                        const tagClass = item.category.toLowerCase().replace(/[^a-z0-9]/g, '');
                        let remainingColor = 'var(--text-secondary)';
                        if (item.daysRemaining <= 3) remainingColor = 'var(--red)';
                        else if (item.daysRemaining <= 7) remainingColor = 'var(--orange)';
                        else remainingColor = 'var(--green)';

                        return (
                          <div key={item.merchant} className="calendar-bill-card">
                            <div className="bill-header">
                              <span className={`category-tag ${tagClass}`} style={{ fontSize: '10px' }}>
                                {item.category}
                              </span>
                              <span className="bill-day-indicator">
                                Monthly: **Day {item.billingDay}**
                              </span>
                            </div>

                            <h4 className="bill-merchant">{item.merchant}</h4>
                            <div className="bill-details">
                              <span className="bill-amount">{formatCurrency(item.amount)}</span>
                              <span className="bill-due-days" style={{ color: remainingColor, fontWeight: 700 }}>
                                {item.daysRemaining === 0 ? 'Due Today' : `Due in ${item.daysRemaining} days`}
                              </span>
                            </div>
                            
                            <div className="bill-progress-track">
                              <div 
                                className="bill-progress-fill" 
                                style={{ 
                                  width: `${Math.max(5, Math.min(100, (30 - item.daysRemaining) / 30 * 100))}%`,
                                  backgroundColor: remainingColor
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 5: MoM Stacked Trends */}
              {activeAnalyticsTab === 'trends' && (
                <div className="analytics-trends-layout">
                  {categoryTrendData.length === 0 ? (
                    <div className="empty-state">No trend data available.</div>
                  ) : (
                    <div className="trends-chart-wrapper">
                      <div className="trends-chart-legend" style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                        <div className="legend-pill"><span className="legend-dot" style={{ backgroundColor: '#ec4899' }}></span> Rent</div>
                        <div className="legend-pill"><span className="legend-dot" style={{ backgroundColor: '#eab308' }}></span> Investment</div>
                        <div className="legend-pill"><span className="legend-dot" style={{ backgroundColor: '#10b981' }}></span> Food</div>
                        <div className="legend-pill"><span className="legend-dot" style={{ backgroundColor: '#60a5fa' }}></span> Shopping</div>
                        <div className="legend-pill"><span className="legend-dot" style={{ backgroundColor: 'var(--text-secondary)' }}></span> Other</div>
                      </div>

                      <div className="trends-bar-chart">
                        {categoryTrendData.map((m) => {
                          const maxTrendVal = Math.max(...categoryTrendData.map(item => item.totalMonthSpend), 1);
                          const pctRent = m.totalMonthSpend > 0 ? (m.totals.Rent / m.totalMonthSpend) * 100 : 0;
                          const pctInvest = m.totalMonthSpend > 0 ? (m.totals.Investment / m.totalMonthSpend) * 100 : 0;
                          const pctFood = m.totalMonthSpend > 0 ? (m.totals.Food / m.totalMonthSpend) * 100 : 0;
                          const pctShop = m.totalMonthSpend > 0 ? (m.totals.Shopping / m.totalMonthSpend) * 100 : 0;
                          const pctOther = m.totalMonthSpend > 0 ? (m.totals.Other / m.totalMonthSpend) * 100 : 0;

                          const heightRatio = (m.totalMonthSpend / maxTrendVal) * 85;

                          return (
                            <div key={m.monthKey} className="trend-bar-wrapper">
                              <div className="trend-bar-fill-container" style={{ height: `${heightRatio}%` }}>
                                <div className="trend-tooltip">
                                  <strong>{m.label} Total: {formatCurrency(m.totalMonthSpend)}</strong>
                                  <div style={{ fontSize: '10px', marginTop: '4px', textAlign: 'left' }}>
                                    Rent: {formatCurrency(m.totals.Rent)}<br/>
                                    Investments: {formatCurrency(m.totals.Investment)}<br/>
                                    Food: {formatCurrency(m.totals.Food)}<br/>
                                    Shopping: {formatCurrency(m.totals.Shopping)}<br/>
                                    Other: {formatCurrency(m.totals.Other)}
                                  </div>
                                </div>
                                
                                {pctRent > 0 && <div className="trend-slice rent" style={{ height: `${pctRent}%`, backgroundColor: '#ec4899' }}></div>}
                                {pctInvest > 0 && <div className="trend-slice invest" style={{ height: `${pctInvest}%`, backgroundColor: '#eab308' }}></div>}
                                {pctFood > 0 && <div className="trend-slice food" style={{ height: `${pctFood}%`, backgroundColor: '#10b981' }}></div>}
                                {pctShop > 0 && <div className="trend-slice shop" style={{ height: `${pctShop}%`, backgroundColor: '#60a5fa' }}></div>}
                                {pctOther > 0 && <div className="trend-slice other" style={{ height: `${pctOther}%`, backgroundColor: 'var(--text-secondary)' }}></div>}
                              </div>
                              <div className="trend-bar-label">{m.label}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 6: Salary History */}
              {activeAnalyticsTab === 'salary' && (
                <div className="analytics-trends-layout">
                  {salaryTrendData.length === 0 || salaryTrendData.every(s => s.amount === 0) ? (
                    <div className="empty-state">No salary transaction data found. Sync your Gmail or add a salary transaction manually.</div>
                  ) : (
                    <div className="trends-chart-wrapper">
                      <div className="trends-chart-legend" style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div className="legend-pill"><span className="legend-dot" style={{ backgroundColor: '#22c55e' }}></span> Monthly Salary Received</div>
                      </div>

                      <div className="trends-bar-chart">
                        {salaryTrendData.map((m) => {
                          const maxSalaryVal = Math.max(...salaryTrendData.map(item => item.amount), 1);
                          const heightRatio = (m.amount / maxSalaryVal) * 85;

                          return (
                            <div key={m.monthKey} className="trend-bar-wrapper">
                              <div className="trend-bar-fill-container" style={{ height: `${heightRatio}%` }}>
                                <div className="trend-tooltip">
                                  <strong>{m.label} Salary: {formatCurrency(m.amount)}</strong>
                                </div>
                                <div className="trend-slice salary" style={{ height: '100%', backgroundColor: '#22c55e', borderRadius: '4px 4px 0 0' }}></div>
                              </div>
                              <div className="trend-bar-label">{m.label}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Visual Charts Row */}
          <div className="visuals-section">
            {/* Monthly Trend Bar Chart */}
            <div className="panel-card">
              <div className="panel-header">
                <h3 className="panel-title">Month-Wise Expense Trend</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Last 6 months</span>
              </div>
              
              {monthlyTrendData.length === 0 ? (
                <div className="empty-state">No month-wise data available</div>
              ) : (
                <div className="chart-container">
                  <div className="bar-chart-y-axis">
                    <div>{formatCurrency(maxMonthlyVal)}</div>
                    <div>{formatCurrency(maxMonthlyVal / 2)}</div>
                    <div>{formatCurrency(0)}</div>
                  </div>
                  <div className="bar-chart-bars">
                    {monthlyTrendData.map((m, idx) => (
                      <div className="bar-wrapper" key={idx}>
                        <div 
                          className="bar-fill" 
                          style={{ height: `${(m.total / maxMonthlyVal) * 85}%` }}
                        >
                          <div className="bar-tooltip">{formatCurrency(m.total)}</div>
                        </div>
                        <div className="bar-label">{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Category Pie/Legend Breakdown */}
            <div className="panel-card">
              <div className="panel-header">
                <h3 className="panel-title">Category Breakdown</h3>
              </div>

              {categoryBreakdown.length === 0 ? (
                <div className="empty-state">No categorized expenses</div>
              ) : (
                <div className="category-breakdown">
                  {categoryBreakdown.map((c) => {
                    const tagClass = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                    return (
                      <div key={c.name} style={{ display: 'block' }}>
                        <div className="category-list-item">
                          <div className="category-info">
                            <span className={`category-dot ${tagClass}`}></span>
                            <span className="category-name">{c.name}</span>
                          </div>
                          <div className="category-stats">
                            <span className="category-amount">{formatCurrency(c.amount)}</span>
                            <span className="category-percent">{c.percentage}%</span>
                          </div>
                        </div>
                        <div className="category-progress-bar">
                          <div 
                            className={`category-progress-fill ${tagClass}`}
                            style={{ width: `${c.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Filters and List */}
          <div className="panel-card">
            <div className="panel-header">
              <h3 className="panel-title">Transaction Ledger</h3>
            </div>

            <div className="filters-bar">
              <div className="search-input-wrapper">
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Search merchant, email subject, content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filters-group">
                <select 
                  className="filter-select"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="Investment">Investment</option>
                  <option value="Rent">Rent</option>
                  <option value="Salary">Salary</option>
                  <option value="UPI Payment">UPI Payment</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Food Delivery">Food Delivery</option>
                  <option value="Dining Out">Dining Out</option>
                  <option value="Travel & Commute">Travel & Commute</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Subscriptions & Entertainment">Subscriptions & Entertainment</option>
                  <option value="Utilities & Bills">Utilities & Bills</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Expenses List Table */}
            <div className="table-wrapper">
              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Loading database files...
                </div>
              ) : filteredExpenses.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📂</div>
                  <p>No transaction emails found matching filters.</p>
                </div>
              ) : (
                <table className="expenses-table">
                  <thead>
                    <tr>
                      <th>Merchant</th>
                      <th>Subject Reference</th>
                      <th>Date</th>
                      <th>Category</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((exp) => {
                      if (!exp) return null;
                      const category = exp.category || 'Other';
                      const tagClass = category.toLowerCase().replace(/[^a-z0-9]/g, '');
                      
                      let displayDate = 'Unknown Date';
                      if (exp.date) {
                        const dateObj = new Date(exp.date);
                        if (!isNaN(dateObj.getTime())) {
                          displayDate = dateObj.toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          });
                        }
                      }

                      const merchant = exp.merchant || 'Unknown Merchant';
                      const subject = exp.subject || '';
                      const amount = typeof exp.amount === 'number' ? exp.amount : 0;
                      const currency = exp.currency || 'INR';

                      return (
                        <tr key={exp.id} onClick={() => setSelectedExpense(exp)}>
                          <td>
                            <div className="merchant-cell">
                              <div className="merchant-avatar">
                                {merchant.charAt(0).toUpperCase()}
                              </div>
                              {merchant}
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-secondary)', maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {subject}
                          </td>
                          <td style={{ color: 'var(--text-muted)' }}>{displayDate}</td>
                          <td>
                            <span className={`category-tag ${tagClass}`}>
                              {category}
                            </span>
                          </td>
                          <td className={`amount-text ${currency.toLowerCase()} ${category === 'Salary' ? 'income' : ''}`}>
                            {category === 'Salary' ? '+' : ''}{currency === 'USD' ? '$' : '₹'}{amount.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', backgroundColor: '#070a11' }}>
        <p>SpendFlow Expenses Tracker • Local Monorepo Workspace</p>
      </footer>

      {/* MODAL 1: Expense Details & Source View */}
      {selectedExpense && (
        <div className="modal-overlay" onClick={() => setSelectedExpense(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Expense Details</h3>
              <button className="close-btn" onClick={() => setSelectedExpense(null)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h4 style={{ fontSize: '24px', fontWeight: 700 }}>{selectedExpense.merchant || 'Unknown Merchant'}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                    Date: {selectedExpense.date ? new Date(selectedExpense.date).toLocaleString() : 'Unknown Date'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: selectedExpense.currency === 'USD' ? 'var(--blue)' : 'var(--text-primary)' }}>
                    {selectedExpense.currency === 'USD' ? '$' : '₹'}{(selectedExpense.amount || 0).toFixed(2)}
                  </div>
                  {selectedExpense.currency === 'USD' && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      approx {formatCurrency(getAmountInINR(selectedExpense))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div className="step-card" style={{ margin: 0, borderStyle: 'solid' }}>
                  <span className="form-label" style={{ marginBottom: '4px' }}>Category Tag</span>
                  {editingExpense === selectedExpense.id ? (
                    <select 
                      className="filter-select"
                      style={{ width: '100%', marginTop: '6px' }}
                      defaultValue={selectedExpense.category}
                      onChange={(e) => updateCategory(selectedExpense.id, e.target.value)}
                    >
                      <option value="Investment">Investment</option>
                      <option value="Rent">Rent</option>
                      <option value="Salary">Salary</option>
                      <option value="UPI Payment">UPI Payment</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Food Delivery">Food Delivery</option>
                      <option value="Dining Out">Dining Out</option>
                      <option value="Travel & Commute">Travel & Commute</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Subscriptions & Entertainment">Subscriptions & Entertainment</option>
                      <option value="Utilities & Bills">Utilities & Bills</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                      <span className={`category-tag ${(selectedExpense.category || 'Other').toLowerCase().replace(/[^a-z0-9]/g, '')}`}>
                        {selectedExpense.category || 'Other'}
                      </span>
                      {dataSource === 'live' && (
                        <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => setEditingExpense(selectedExpense.id)}>
                          Edit
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="step-card" style={{ margin: 0, borderStyle: 'solid' }}>
                  <span className="form-label" style={{ marginBottom: '4px' }}>Email Sender</span>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', wordBreak: 'break-all' }}>
                    {selectedExpense.from}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <span className="form-label">Email Header Subject</span>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', fontSize: '13px', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', fontWeight: 500 }}>
                  {selectedExpense.subject}
                </div>
              </div>

              <div>
                <span className="form-label">Source Email Body (Snippet parsed)</span>
                <div className="snippet-box">
                  {selectedExpense.bodySummary || selectedExpense.snippet}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {dataSource === 'live' && (
                <button className="btn btn-secondary" style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)', color: 'var(--red)', borderColor: 'rgba(248, 113, 113, 0.2)' }} onClick={() => deleteExpense(selectedExpense.id)}>
                  🗑️ Delete Entry
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => { setSelectedExpense(null); setEditingExpense(null); }}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Setup Credentials Wizard */}
      {showSetupWizard && (
        <div className="modal-overlay" onClick={() => setShowSetupWizard(false)}>
          <div className="modal-content" style={{ maxWidth: '650px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Setup Google OAuth Credentials</h3>
              <button className="close-btn" onClick={() => setShowSetupWizard(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <form onSubmit={saveCredentials}>
              <div className="modal-body">
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.6 }}>
                  To download transaction emails directly, you need to link a Google Cloud developer project to this local application. Follow these instructions:
                </p>

                <div className="step-card">
                  <span className="step-num">1</span>
                  <span className="step-title">Create GCP Project & OAuth Consent</span>
                  <p className="helper-text">
                    Go to the <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">Google Cloud Console</a>. Create a project, then configure the <strong>OAuth Consent Screen</strong>. Set User Type to <strong>External</strong> and add your own gmail address to the <strong>Test Users</strong> list (important, since app remains in sandbox!).
                  </p>
                </div>

                <div className="step-card">
                  <span className="step-num">2</span>
                  <span className="step-title">Enable Gmail API</span>
                  <p className="helper-text">
                    In Cloud Console sidebar, go to <strong>Enabled APIs & Services</strong>. Click <strong>+ ENABLE APIS AND SERVICES</strong>, search for <strong>Gmail API</strong>, and click <strong>Enable</strong>.
                  </p>
                </div>

                <div className="step-card">
                  <span className="step-num">3</span>
                  <span className="step-title">Create Web App Credentials</span>
                  <p className="helper-text">
                    Go to <strong>Credentials</strong> → <strong>Create Credentials</strong> → <strong>OAuth Client ID</strong>. Set application type to <strong>Web Application</strong>. Under <strong>Authorized redirect URIs</strong>, add exactly:<br/>
                    <code style={{ background: '#000', color: 'var(--blue)', padding: '2px 6px', display: 'inline-block', marginTop: '4px', borderRadius: '4px' }}>http://localhost:3001/api/auth/callback</code>
                  </p>
                </div>

                {authStatus.hasCredentials ? (
                  <div style={{ padding: '12px', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid var(--green)', borderRadius: '6px', marginBottom: '20px', color: 'var(--green)', fontSize: '13px', fontWeight: 600 }}>
                    ✓ Credentials file exists on disk. You can overwrite them by submitting below, or click "Authenticate Now" to sign in.
                  </div>
                ) : (
                  <div style={{ padding: '12px', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid var(--orange)', borderRadius: '6px', marginBottom: '20px', color: 'var(--orange)', fontSize: '13px', fontWeight: 600 }}>
                    ⚠ Missing credentials. Enter details below to create credentials.json on backend disk.
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Client ID</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="xxxxxxxxx.apps.googleusercontent.com"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Client Secret</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSetupWizard(false)}>
                  Close
                </button>
                <button type="submit" className="btn btn-secondary" style={{ borderColor: 'var(--purple)', color: 'var(--purple)' }}>
                  Save Credentials
                </button>
                {authStatus.hasCredentials && (
                  <button type="button" className="btn btn-primary" onClick={startOAuthFlow}>
                    🔑 Authenticate Account
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Raw EML parser */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Parse Raw Email (EML / Text)</h3>
              <button className="close-btn" onClick={() => setShowUploadModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleRawUpload}>
              <div className="modal-body">
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px', lineHeight: 1.6 }}>
                  Don't want to configure the Google Cloud API? Paste the subject and body of any payment/receipt email below. Our local backend engine will run regex parsing rules to categorize and record the transaction.
                </p>

                <div className="form-group">
                  <label className="form-label">Subject Header</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Swiggy Order Receipt #81928"
                    value={rawSubject}
                    onChange={(e) => setRawSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Transaction Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={rawDate}
                    onChange={(e) => setRawDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Body Content</label>
                  <textarea 
                    className="form-input" 
                    style={{ height: '160px', fontFamily: 'monospace', resize: 'vertical' }}
                    placeholder="Paste the email text copy here. Example: 'Your order was successful. Paid total Rs. 550 via debit card at Swiggy.'"
                    value={rawBody}
                    onChange={(e) => setRawBody(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Extract & Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4a: Bank Statement Upload & Reconcile */}
      {showStatementModal && (
        <div className="modal-overlay" onClick={() => { if (!statementUploading) setShowStatementModal(false); }}>
          <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🏦 Upload Bank Statement</h3>
              <button className="close-btn" onClick={() => { if (!statementUploading) setShowStatementModal(false); }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {statementResult ? (
              /* ── Reconciliation Results ── */
              <div className="modal-body">
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>✅</div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--green)' }}>Reconciliation Complete</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
                    Your bank statement has been cross-checked against existing transactions.
                  </p>
                </div>

                {/* Summary counts */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { label: 'Bank Entries', value: statementResult.totalBankTransactions, color: 'var(--blue)' },
                    { label: 'Matched', value: statementResult.matched, color: 'var(--purple)' },
                    { label: 'Updated', value: statementResult.updated, color: 'var(--orange)' },
                    { label: 'New Added', value: statementResult.added, color: 'var(--green)' }
                  ].map(card => (
                    <div key={card.label} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '26px', fontWeight: 800, color: card.color }}>{card.value}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>{card.label}</div>
                    </div>
                  ))}
                </div>

                {/* Updated details */}
                {statementResult.updatedDetails && statementResult.updatedDetails.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h5 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--orange)', marginBottom: '10px' }}>
                      🔄 Category / Merchant Updates ({statementResult.updatedDetails.length})
                    </h5>
                    <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                      <table className="expenses-table" style={{ fontSize: '12px' }}>
                        <thead>
                          <tr>
                            <th>Bank Narration</th>
                            <th>Old Category</th>
                            <th>New Category</th>
                            <th style={{ textAlign: 'right' }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {statementResult.updatedDetails.map((u, i) => (
                            <tr key={i}>
                              <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{u.bankNarration}</td>
                              <td><span className="category-tag" style={{ opacity: 0.6 }}>{u.oldCategory}</span></td>
                              <td><span className="category-tag" style={{ borderColor: 'var(--orange)', color: 'var(--orange)' }}>{u.newCategory}</span></td>
                              <td style={{ textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>₹{Number(u.amount).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Added details */}
                {statementResult.addedDetails && statementResult.addedDetails.length > 0 && (
                  <div>
                    <h5 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green)', marginBottom: '10px' }}>
                      ➕ New Transactions Added ({statementResult.addedDetails.length})
                    </h5>
                    <div style={{ maxHeight: '160px', overflowY: 'auto' }}>
                      <table className="expenses-table" style={{ fontSize: '12px' }}>
                        <thead>
                          <tr>
                            <th>Merchant</th>
                            <th>Category</th>
                            <th>Date</th>
                            <th style={{ textAlign: 'right' }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {statementResult.addedDetails.map((a, i) => (
                            <tr key={i}>
                              <td style={{ fontWeight: 600 }}>{a.merchant}</td>
                              <td><span className="category-tag">{a.category}</span></td>
                              <td style={{ color: 'var(--text-muted)' }}>{new Date(a.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                              <td style={{ textAlign: 'right', color: 'var(--green)', fontWeight: 600 }}>₹{Number(a.amount).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {statementResult.updated === 0 && statementResult.added === 0 && (
                  <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    All transactions were already present and correctly categorised. No changes needed.
                  </div>
                )}
              </div>
            ) : (
              /* ── Upload Form ── */
              <form onSubmit={handleStatementUpload}>
                <div className="modal-body">
                  {dataSource === 'demo' && (
                    <div style={{ padding: '12px', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid var(--orange)', borderRadius: '8px', marginBottom: '20px', color: 'var(--orange)', fontSize: '13px', fontWeight: 600 }}>
                      ⚠ You are in Demo Sandbox mode. Switch to <strong>Live Workspace / Local DB</strong> to upload a real bank statement.
                    </div>
                  )}

                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px', lineHeight: 1.7 }}>
                    Upload your monthly bank statement as a <strong>CSV file</strong>. The app will automatically detect
                    your bank format and cross-check every debit entry against your existing transactions — updating
                    categories and merchants where your bank's narration provides better data, and adding any
                    transactions that were missed in the Gmail sync.
                  </p>

                  {/* Bank format guide */}
                  <div className="step-card" style={{ marginBottom: '20px' }}>
                    <span className="step-num">?</span>
                    <span className="step-title">Supported Bank Formats (CSV)</span>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '10px' }}>
                      {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank', 'Generic CSV'].map(bank => (
                        <div key={bank} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                          {bank}
                        </div>
                      ))}
                    </div>
                    <p className="helper-text" style={{ marginTop: '10px' }}>
                      To download: Login to your bank's Net Banking → Statements → Download as CSV (not PDF).
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bank Statement CSV File</label>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      className="form-input"
                      style={{ cursor: 'pointer', padding: '10px' }}
                      onChange={(e) => setStatementFile(e.target.files[0] || null)}
                      required
                    />
                    {statementFile && (
                      <p style={{ fontSize: '12px', color: 'var(--green)', marginTop: '6px' }}>
                        ✓ Selected: {statementFile.name} ({(statementFile.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>

                  <div style={{ padding: '12px', background: 'rgba(96, 165, 250, 0.08)', border: '1px solid rgba(96, 165, 250, 0.2)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--blue)' }}>How reconciliation works:</strong><br/>
                    • Debits from your statement are matched to existing transactions by date (±2 days) and amount (±2%)<br/>
                    • Matched entries get their category and merchant updated if the bank narration is more specific<br/>
                    • Unmatched entries are inserted as new transactions (source: bank statement)<br/>
                    • Credit entries (salary, refunds) are skipped — only outflows are processed
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowStatementModal(false)} disabled={statementUploading}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={statementUploading || !statementFile || dataSource === 'demo'}>
                    {statementUploading ? (
                      <>
                        <svg className="rotating" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                        </svg>
                        Reconciling...
                      </>
                    ) : '🔍 Reconcile Transactions'}
                  </button>
                </div>
              </form>
            )}

            {statementResult && (
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => { setStatementResult(null); setStatementFile(null); }}>
                  Upload Another
                </button>
                <button className="btn btn-primary" onClick={() => setShowStatementModal(false)}>
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 4: Add Transaction Manually */}
      {showAddManualModal && (
        <div className="modal-overlay" onClick={() => setShowAddManualModal(false)}>
          <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Transaction Manually</h3>
              <button className="close-btn" onClick={() => setShowAddManualModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddManualSubmit}>
              <div className="modal-body">
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px', lineHeight: 1.6 }}>
                  Enter the transaction details manually. This transaction will be recorded directly {dataSource === 'demo' ? 'in-memory (Sandbox mode)' : 'to your database'}.
                </p>

                <div className="form-group">
                  <label className="form-label">Merchant Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Zomato, Starbucks, Rent"
                    value={manualMerchant}
                    onChange={(e) => setManualMerchant(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Amount</label>
                    <input 
                      type="number" 
                      step="any"
                      min="0.01"
                      className="form-input" 
                      placeholder="0.00"
                      value={manualAmount}
                      onChange={(e) => setManualAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Currency</label>
                    <select 
                      className="filter-select" 
                      style={{ width: '100%', padding: '12px 16px' }}
                      value={manualCurrency}
                      onChange={(e) => setManualCurrency(e.target.value)}
                    >
                      <option value="INR">₹ INR</option>
                      <option value="USD">$ USD</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Transaction Date</label>
                    <input 
                      type="date" 
                      className="form-input"
                      value={manualDate}
                      onChange={(e) => setManualDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Category</label>
                    <select 
                      className="filter-select"
                      style={{ width: '100%', padding: '12px 16px' }}
                      value={manualCategory}
                      onChange={(e) => setManualCategory(e.target.value)}
                    >
                      <option value="Investment">Investment</option>
                      <option value="Rent">Rent</option>
                      <option value="Salary">Salary</option>
                      <option value="UPI Payment">UPI Payment</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Food Delivery">Food Delivery</option>
                      <option value="Dining Out">Dining Out</option>
                      <option value="Travel & Commute">Travel & Commute</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Subscriptions & Entertainment">Subscriptions & Entertainment</option>
                      <option value="Utilities & Bills">Utilities & Bills</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes / Description (Optional)</label>
                  <textarea 
                    className="form-input" 
                    style={{ height: '100px', resize: 'vertical' }}
                    placeholder="E.g. Dinner with friends, monthly electric bill, etc."
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddManualModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

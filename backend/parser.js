/**
 * Regex-based email parser to extract expense information.
 */

const EMPLOYEE_ID = '00571973';

// Helper to match keyword safely, using word boundaries for short keywords (<= 4 chars)
// to avoid matching inside other words (e.g., 'rent' in 'different', 'ola' in 'chocolate')
function matchesKeyword(text, keyword) {
  const kw = keyword.toLowerCase();
  const t = text.toLowerCase();
  if (kw.length <= 4) {
    const escaped = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    return regex.test(t);
  }
  return t.includes(kw);
}

// Known merchant mappings to categories (Initial guess, content scan overrides this)
const MERCHANT_RULES = [
  { keywords: ['groww', 'zerodha', 'smallcase', 'indmoney', 'coin', 'mutual fund', 'sip', 'securities', 'etmoney', 'nps', 'ppf'], category: 'Investment' },
  { keywords: ['onecard', 'sbi card', 'hdfc cc', 'icici card', 'amex', 'credit card', 'card ending'], category: 'Credit Card' },
  { keywords: ['swiggy', 'zomato', 'ubereats', 'blinkit', 'zepto', 'instamart'], category: 'Food Delivery' },
  { keywords: ['starbucks', 'mcdonald', 'dominos', 'pizza', 'restaurant', 'cafe', 'bar', 'kitchen', 'brewery', 'pub', 'diner'], category: 'Dining Out' },
  { keywords: ['uber', 'ola', 'taxi', 'irctc', 'indigo', 'makemytrip', 'airlines', 'railway', 'flight'], category: 'Travel & Commute' },
  { keywords: ['amazon', 'flipkart', 'walmart', 'target', 'myntra', 'ajio', 'nykaa', 'tata cliq', 'shopify'], category: 'Shopping' },
  { keywords: ['netflix', 'spotify', 'steam', 'youtube premium', 'apple.com/bill', 'itunes', 'disney', 'hotstar'], category: 'Subscriptions & Entertainment' },
  { keywords: ['electricity', 'bescom', 'recharge', 'jio', 'airtel', 'act fibernet', 'broadband', 'telecom', 'gas', 'water'], category: 'Utilities & Bills' },
  { keywords: ['rent', 'houserent', 'house rent', 'landlord'], category: 'Rent' }
];

/**
 * Normalizes merchant names based on text keywords
 */
function normalizeMerchant(text, fromEmail = '') {
  const normalizedText = text.toLowerCase() + ' ' + fromEmail.toLowerCase();

  // Custom exact overrides for investments first
  if (normalizedText.includes('etmoney')) return 'ETMoney';
  if (matchesKeyword(normalizedText, 'nps') || normalizedText.includes('national pension')) return 'NPS';
  if (matchesKeyword(normalizedText, 'ppf') || normalizedText.includes('public provident')) return 'PPF';
  if (matchesKeyword(normalizedText, 'coin')) return 'Coin';
  if (matchesKeyword(normalizedText, 'rent') || normalizedText.includes('landlord')) return 'Rent';
  if (normalizedText.includes('salary') || normalizedText.includes(EMPLOYEE_ID)) return 'Salary Payout';

  // Try to find a matched rule
  for (const rule of MERCHANT_RULES) {
    for (const kw of rule.keywords) {
      if (matchesKeyword(normalizedText, kw)) {
        if (kw === 'apple.com/bill' || kw === 'itunes') return 'Apple';
        if (kw === 'youtube premium') return 'YouTube';
        return kw.charAt(0).toUpperCase() + kw.slice(1);
      }
    }
  }

  // Fallback: extract merchant from sender email or domain
  if (fromEmail) {
    const match = fromEmail.match(/@([^.]+)\./);
    if (match && match[1]) {
      const name = match[1];
      if (!['gmail', 'yahoo', 'outlook', 'hotmail', 'mail'].includes(name.toLowerCase())) {
        return name.charAt(0).toUpperCase() + name.slice(1);
      }
    }
  }

  // Try extracting from subject (e.g. "Your order at X")
  const orderAtMatch = text.match(/(?:order at|purchase from|payment to|spent at)\s+([A-Za-z0-9\s]+?)(?:\.|for|on|$)/i);
  if (orderAtMatch && orderAtMatch[1]) {
    const candidate = orderAtMatch[1].trim();
    if (candidate.length > 2 && candidate.length < 25) {
      return candidate;
    }
  }

  return 'Unknown Merchant';
}

/**
 * Determines the category based on content scanning
 */
function getCategoryByContent(subject, snippet, body, merchantName) {
  const fullText = `${subject} ${snippet} ${body}`.toLowerCase();
  const merchantLower = merchantName.toLowerCase();

  // ── Employee ID: highest-confidence salary signal ─────────────────────────
  // If the user's employee ID appears anywhere in the email, it is definitely
  // a salary notification from their employer's payroll system.
  if (fullText.includes(EMPLOYEE_ID)) {
    return 'Salary';
  }

  // Salary / payroll — expanded keyword set covers Indian bank narrations
  // that may say "payroll", "sal credit", "wages" etc. without "salary"
  const SALARY_CAT_KW = [
    'salary', 'payroll', 'sal credit', 'salary credit', 'salary paid',
    'salary deposited', 'salary disbursed', 'salary transfer', 'salary for',
    'monthly salary', 'wages', 'remuneration', 'pay roll', 'stipend', 'monthly pay'
  ];
  if (SALARY_CAT_KW.some(kw => fullText.includes(kw) || merchantLower.includes(kw))) {
    return 'Salary';
  }

  // Helper helper to check list matches safely
  const hasKeyword = (keywords) => {
    return keywords.some(kw => matchesKeyword(fullText, kw) || matchesKeyword(merchantLower, kw));
  };

  // 1. Investment
  const investmentKeywords = ['groww', 'zerodha', 'mutual fund', 'mutualfund', 'sip', 'smallcase', 'coin by', 'coin', 'wazirx', 'investment', 'invested', 'securities', 'indmoney', 'axis direct', 'hsb mutual', 'demat', 'stocks', 'ipo fund', 'etmoney', 'nps', 'ppf', 'national pension', 'public provident', 'provident fund', 'nps contribution', 'ppf contribution'];
  if (hasKeyword(investmentKeywords)) {
    return 'Investment';
  }

  // 1.5 Rent
  const rentKeywords = ['rent', 'houserent', 'house rent', 'landlord', 'rent payment', 'rent paid'];
  if (hasKeyword(rentKeywords)) {
    return 'Rent';
  }

  // 2. Credit Card
  const ccKeywords = ['credit card', 'hdfc cc', 'sbi card', 'icici card', 'onecard', 'amex', 'american express', 'card bill', 'cc payment', 'total amount due', 'minimum amount due', 'card ending in'];
  if (hasKeyword(ccKeywords)) {
    return 'Credit Card';
  }

  // 3. UPI
  const upiKeywords = ['upi ref', 'transfer via upi', 'upi transfer', 'vpa', 'paytm wallet', 'gpay', 'phonepe', 'bhim upi', 'upi/', 'upi payment', 'sent money via upi', 'debited via upi'];
  if (hasKeyword(upiKeywords)) {
    return 'UPI Payment';
  }

  // 4. Food Delivery
  const foodDeliveryKeywords = ['swiggy', 'zomato', 'ubereats', 'foodpanda', 'instamart', 'blinkit', 'zepto'];
  if (hasKeyword(foodDeliveryKeywords)) {
    return 'Food Delivery';
  }

  // 5. Dining Out
  const diningKeywords = ['starbucks', 'mcdonald', 'dominos', 'pizza', 'restaurant', 'grill', 'cafe', 'bar & kitchen', 'brewery', 'diner', 'pub', 'patisserie', 'bakery', 'coffee house', 'bistro'];
  if (hasKeyword(diningKeywords)) {
    return 'Dining Out';
  }

  // 6. Travel & Commute
  const travelKeywords = ['uber', 'lyft', 'ola', 'grab', 'taxi', 'irctc', 'indigo', 'airlines', 'flight', 'railway', 'makemytrip', 'easemytrip', 'goibibo', 'hotel', 'metro', 'toll', 'fastag'];
  if (hasKeyword(travelKeywords)) {
    return 'Travel & Commute';
  }

  // 7. Shopping
  const shoppingKeywords = ['amazon', 'flipkart', 'walmart', 'target', 'ebay', 'aliexpress', 'shopify', 'bestbuy', 'ikea', 'myntra', 'ajio', 'nykaa', 'tata cliq', 'clothing', 'retail'];
  if (hasKeyword(shoppingKeywords)) {
    return 'Shopping';
  }

  // 8. Subscriptions & Entertainment
  const subKeywords = ['netflix', 'spotify', 'steam', 'disney', 'hulu', 'hbo', 'playstation', 'xbox', 'nintendo', 'itunes', 'apple.com/bill', 'youtube premium', 'membership', 'subscription', 'renewed', 'patreon'];
  if (hasKeyword(subKeywords)) {
    return 'Subscriptions & Entertainment';
  }

  // 9. Utilities & Bills
  const utilityKeywords = ['electricity', 'power', 'water', 'comcast', 'verizon', 'att', 't-mobile', 'recharge', 'telecom', 'insurance', 'gas', 'bill payment', 'jio', 'airtel', 'act fibernet', 'broadband'];
  if (hasKeyword(utilityKeywords)) {
    return 'Utilities & Bills';
  }

  return 'Other';
}

/**
 * Extracts expense amount and currency
 */
function extractAmountAndCurrency(subject, snippet, body) {
  let cleanSubject = subject || '';
  let cleanSnippet = snippet || '';
  let cleanBody = body || '';
  
  // Pre-process text to remove "available limit", "available balance", "credit limit", "account balance" patterns
  // to avoid extracting the balance/limit instead of the transaction amount
  const ignorePatterns = [
    /available\s+(?:limit|balance|bal)\D*[\d,]+(?:\.\d{2})?/gi,
    /credit\s+limit\D*[\d,]+(?:\.\d{2})?/gi,
    /bal(?:ance)?\s*(?:is|outstanding)\D*[\d,]+(?:\.\d{2})?/gi,
    /unbilled\s+outstanding\D*[\d,]+(?:\.\d{2})?/gi,
    /ledger\s+balance\D*[\d,]+(?:\.\d{2})?/gi,
    /limit\s+is\D*[\d,]+(?:\.\d{2})?/gi
  ];
  
  ignorePatterns.forEach(pattern => {
    cleanSubject = cleanSubject.replace(pattern, '');
    cleanSnippet = cleanSnippet.replace(pattern, '');
    cleanBody = cleanBody.replace(pattern, '');
  });

  const searchTexts = [cleanSubject, cleanSnippet, cleanBody].filter(Boolean);
  
  // Look for INR / Rs. patterns first
  const inrRegexes = [
    /(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{2})?)/i,
    /([\d,]+(?:\.\d{2})?)\s*(?:Rs\.?|INR|₹)/i,
    /debited\s*(?:by|with)?\s*(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{2})?)/i,
    /spent\s*(?:Rs\.?|INR|₹)?\s*([\d,]+(?:\.\d{2})?)/i
  ];

  // Look for USD / $ patterns
  const usdRegexes = [
    /(?:\$|USD)\s*([\d,]+(?:\.\d{2})?)/i,
    /([\d,]+(?:\.\d{2})?)\s*USD/i,
    /total\s*of\s*(?:\$|USD)?\s*([\d,]+(?:\.\d{2})?)/i,
    /charge\s*of\s*(?:\$|USD)?\s*([\d,]+(?:\.\d{2})?)/i
  ];

  // Check INR matches
  for (const text of searchTexts) {
    for (const regex of inrRegexes) {
      const match = text.match(regex);
      if (match) {
        const valStr = match[1].replace(/,/g, '');
        const amount = parseFloat(valStr);
        if (!isNaN(amount) && amount > 0) {
          return { amount, currency: 'INR' };
        }
      }
    }
  }

  // Check USD matches
  for (const text of searchTexts) {
    for (const regex of usdRegexes) {
      const match = text.match(regex);
      if (match) {
        const valStr = match[1].replace(/,/g, '');
        const amount = parseFloat(valStr);
        if (!isNaN(amount) && amount > 0) {
          return { amount, currency: 'USD' };
        }
      }
    }
  }

  // Generic fallback for decimal numbers that look like prices
  const genericPriceRegex = /(?:total|amount|price|charge|paid|spent|cost|sum)\D*([\d,]+\.\d{2})/i;
  for (const text of searchTexts) {
    const match = text.match(genericPriceRegex);
    if (match) {
      const valStr = match[1].replace(/,/g, '');
      const amount = parseFloat(valStr);
      if (!isNaN(amount) && amount > 0) {
        // Detect currency symbol nearby
        const index = text.indexOf(match[1]);
        const context = text.slice(Math.max(0, index - 5), Math.min(text.length, index + match[1].length + 5)).toLowerCase();
        
        let currency = 'INR'; // Safe default for an Indian expense tracker
        
        // Match USD indicators
        if (context.includes('$') || context.includes('usd')) {
          currency = 'USD';
        } else {
          // Check if the overall email mentions USD and not Rupees nearby
          const fullEmailLower = `${subject || ''} ${snippet || ''} ${body || ''}`.toLowerCase();
          if (fullEmailLower.includes('$') || fullEmailLower.includes('usd')) {
            if (!context.includes('₹') && !context.includes('rs') && !context.includes('inr')) {
              currency = 'USD';
            }
          }
        }
        return { amount, currency };
      }
    }
  }

  return null;
}

/**
 * Core parsing function
 */
function parseEmail(email) {
  const { id, subject = '', snippet = '', body = '', from = '', date } = email;

  const subjectSnippet = `${subject} ${snippet}`.toLowerCase();
  const fullText = `${subject} ${snippet} ${body}`.toLowerCase();

  // 1. Ignore failed, declined, cancelled, reversed, or returned transactions
  const failKeywords = [
    'failed', 'decline', 'cancel', 'reverse', 'unsuccessful', 'bounce', 'rejected', 'void', 'failure'
  ];
  if (failKeywords.some(kw => subjectSnippet.includes(kw))) {
    return null;
  }

  // 2. Extract amount early — required for the large-credit salary heuristic below
  const amountDetails = extractAmountAndCurrency(subject, snippet, body);
  if (!amountDetails) {
    return null; // Skip if no amount is found
  }

  // 3. Salary / payroll detection — expanded to catch Indian bank NEFT narrations
  //    that don't contain the word "salary" (e.g. "Account Credited via NEFT")
  const SALARY_KW = [
    'salary', 'payroll', 'sal credit', 'salary credit', 'salary paid',
    'salary deposited', 'salary disbursed', 'salary transfer', 'salary for the month',
    'monthly salary', 'wages', 'remuneration', 'pay roll', 'stipend'
  ];

  // Salary keywords must match in the subject+snippet (first 150 chars) — NOT just
  // anywhere in the body, which catches promotional emails like:
  //   "Protect Your Take-Home Salary" (ClearTax)
  //   "Salary Credited. Bags Packed??" (ixigo)
  //   "Get Salary upto Rs.40000" (WorkIndia job ads)
  const isSalaryKeyword = SALARY_KW.some(kw => subjectSnippet.includes(kw));

  // Block promotional / marketing senders that mention salary in ad context.
  // Real salary alerts always come from bank domains.
  const PROMO_SENDER_PATTERNS = [
    /workindia/i, /ixigo/i, /naukri/i, /linkedin/i, /indeed/i,
    /cleartax/i, /zerodha/i, /groww/i, /paytm/i, /policybazaar/i,
    /moneycontrol/i, /economictimes/i, /jobs?\./i, /career/i
  ];
  const isPromoSender = PROMO_SENDER_PATTERNS.some(re => re.test(from));

  // Heuristic: a large NEFT/IMPS/bank credit (≥ ₹25,000) from a bank sender is
  // almost certainly a salary or large transfer — keep it even if "salary" is absent.
  // Requires a real bank sender domain to avoid job-ad false positives.
  const BANK_SENDER_PATTERN = /\.net$|hdfcbank|icicibank|sbi\.co|axisbank|kotakbank|yesbank|federalbank|idfcfirst|indusind|pnb|bob\.co|rbl|citi|hsbc|sc\.com/i;
  const isLargeBankCredit =
    !isPromoSender &&
    BANK_SENDER_PATTERN.test(from) &&
    amountDetails.currency === 'INR' &&
    amountDetails.amount >= 25000 &&
    (subjectSnippet.includes('neft') || subjectSnippet.includes('imps') ||
     subjectSnippet.includes('credited') || subjectSnippet.includes('credit')) &&
    !subjectSnippet.includes('refund') &&
    !subjectSnippet.includes('cashback') &&
    !subjectSnippet.includes('redemption');

  const isSalary = (isSalaryKeyword && !isPromoSender) || isLargeBankCredit || fullText.includes(EMPLOYEE_ID);

  // 4. Skip pure inflow emails (refunds, cashbacks) — but NOT salary / large credits
  //    NOTE: bare "credited" is intentionally removed — it is too broad and blocks salary.
  if (!isSalary) {
    const inflowKeywords = [
      'payment received', 'refund', 'redemption', 'cashback received',
      'money received', 'auto-credited', 'reversal', 'received payment',
      'refund credited', 'cashback credited', 'interest credited'
    ];
    if (inflowKeywords.some(kw => subjectSnippet.includes(kw))) {
      return null;
    }
  }

  // Extract merchant — for large bank credits or employee ID matches without an explicit salary keyword,
  // default to 'Salary Payout' so the dashboard labels it correctly.
  const merchant = (isLargeBankCredit || fullText.includes(EMPLOYEE_ID)) && !isSalaryKeyword
    ? 'Salary Payout'
    : normalizeMerchant(subject + ' ' + snippet, from);

  // Extract category — force 'Salary' for large bank credits or employee ID matches so they show up
  // in the Salary metric card even when "salary" is absent from the email.
  const category = (isLargeBankCredit || fullText.includes(EMPLOYEE_ID)) && !isSalaryKeyword
    ? 'Salary'
    : getCategoryByContent(subject, snippet, body, merchant);

  // Format date
  let parsedDate;
  if (date) {
    parsedDate = new Date(date);
  } else {
    parsedDate = new Date();
  }

  // If the date is invalid, use current date
  if (isNaN(parsedDate.getTime())) {
    parsedDate = new Date();
  }

  return {
    id,
    date: parsedDate.toISOString(),
    amount: amountDetails.amount,
    currency: amountDetails.currency,
    merchant,
    category,
    subject,
    snippet: snippet.substring(0, 150),
    from,
    bodySummary: body.substring(0, 500)
  };
}

module.exports = {
  parseEmail,
  normalizeMerchant,
  getCategoryByContent,
  extractAmountAndCurrency
};

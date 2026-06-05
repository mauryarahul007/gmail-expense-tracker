/**
 * Regex-based email parser to extract expense information.
 */

// Known merchant mappings to categories (Initial guess, content scan overrides this)
const MERCHANT_RULES = [
  { keywords: ['groww', 'zerodha', 'smallcase', 'indmoney', 'coin', 'mutual fund', 'sip', 'securities', 'etmoney', 'nps', 'ppf'], category: 'Investment' },
  { keywords: ['onecard', 'sbi card', 'hdfc cc', 'icici card', 'amex', 'credit card', 'card ending'], category: 'Credit Card' },
  { keywords: ['swiggy', 'zomato', 'ubereats', 'blinkit', 'zepto', 'instamart'], category: 'Food Delivery' },
  { keywords: ['starbucks', 'mcdonald', 'dominos', 'pizza', 'restaurant', 'cafe', 'bar', 'kitchen', 'brewery', 'pub', 'diner'], category: 'Dining Out' },
  { keywords: ['uber', 'ola', 'taxi', 'irctc', 'indigo', 'makemytrip', 'airlines', 'railway', 'flight'], category: 'Travel & Commute' },
  { keywords: ['amazon', 'flipkart', 'walmart', 'target', 'myntra', 'ajio', 'nykaa', 'tata cliq', 'shopify'], category: 'Shopping' },
  { keywords: ['netflix', 'spotify', 'steam', 'youtube premium', 'apple.com/bill', 'itunes', 'disney', 'hotstar'], category: 'Subscriptions & Entertainment' },
  { keywords: ['electricity', 'bescom', 'recharge', 'jio', 'airtel', 'act fibernet', 'comcast', 'verizon', 'att', 'telecom', 'gas', 'water'], category: 'Utilities & Bills' }
];

/**
 * Normalizes merchant names based on text keywords
 */
function normalizeMerchant(text, fromEmail = '') {
  const normalizedText = text.toLowerCase() + ' ' + fromEmail.toLowerCase();

  // Custom exact overrides for investments first
  if (normalizedText.includes('etmoney')) return 'ETMoney';
  if (normalizedText.includes('nps') || normalizedText.includes('national pension')) return 'NPS';
  if (normalizedText.includes('ppf') || normalizedText.includes('public provident')) return 'PPF';
  if (normalizedText.includes('coin')) return 'Coin';

  // Try to find a matched rule
  for (const rule of MERCHANT_RULES) {
    for (const kw of rule.keywords) {
      if (normalizedText.includes(kw)) {
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

  // 1. Investment
  const investmentKeywords = ['groww', 'zerodha', 'mutual fund', 'mutualfund', 'sip', 'smallcase', 'coin by', 'coin', 'wazirx', 'investment', 'invested', 'securities', 'indmoney', 'axis direct', 'hsb mutual', 'demat', 'stocks', 'ipo fund', 'etmoney', 'nps', 'ppf', 'national pension', 'public provident', 'provident fund', 'nps contribution', 'ppf contribution'];
  if (investmentKeywords.some(kw => fullText.includes(kw) || merchantLower.includes(kw))) {
    return 'Investment';
  }

  // 2. Credit Card
  const ccKeywords = ['credit card', 'hdfc cc', 'sbi card', 'icici card', 'onecard', 'amex', 'american express', 'card bill', 'cc payment', 'total amount due', 'minimum amount due', 'card ending in'];
  if (ccKeywords.some(kw => fullText.includes(kw) || merchantLower.includes(kw))) {
    return 'Credit Card';
  }

  // 3. UPI
  const upiKeywords = ['upi ref', 'transfer via upi', 'upi transfer', 'vpa', 'paytm wallet', 'gpay', 'phonepe', 'bhim upi', 'upi/', 'upi payment', 'sent money via upi', 'debited via upi'];
  if (upiKeywords.some(kw => fullText.includes(kw) || merchantLower.includes(kw))) {
    return 'UPI Payment';
  }

  // 4. Food Delivery
  const foodDeliveryKeywords = ['swiggy', 'zomato', 'ubereats', 'foodpanda', 'instamart', 'blinkit', 'zepto'];
  if (foodDeliveryKeywords.some(kw => fullText.includes(kw) || merchantLower.includes(kw))) {
    return 'Food Delivery';
  }

  // 5. Dining Out
  const diningKeywords = ['starbucks', 'mcdonald', 'dominos', 'pizza', 'restaurant', 'grill', 'cafe', 'bar & kitchen', 'brewery', 'diner', 'pub', 'patisserie', 'bakery', 'coffee house', 'bistro'];
  if (diningKeywords.some(kw => fullText.includes(kw) || merchantLower.includes(kw))) {
    return 'Dining Out';
  }

  // 6. Travel & Commute
  const travelKeywords = ['uber', 'lyft', 'ola', 'grab', 'taxi', 'irctc', 'indigo', 'airlines', 'flight', 'railway', 'makemytrip', 'easemytrip', 'goibibo', 'hotel', 'metro', 'toll', 'fastag'];
  if (travelKeywords.some(kw => fullText.includes(kw) || merchantLower.includes(kw))) {
    return 'Travel & Commute';
  }

  // 7. Shopping
  const shoppingKeywords = ['amazon', 'flipkart', 'walmart', 'target', 'ebay', 'aliexpress', 'shopify', 'bestbuy', 'ikea', 'myntra', 'ajio', 'nykaa', 'tata cliq', 'clothing', 'retail'];
  if (shoppingKeywords.some(kw => fullText.includes(kw) || merchantLower.includes(kw))) {
    return 'Shopping';
  }

  // 8. Subscriptions & Entertainment
  const subKeywords = ['netflix', 'spotify', 'steam', 'disney', 'hulu', 'hbo', 'playstation', 'xbox', 'nintendo', 'itunes', 'apple.com/bill', 'youtube premium', 'membership', 'subscription', 'renewed', 'patreon'];
  if (subKeywords.some(kw => fullText.includes(kw) || merchantLower.includes(kw))) {
    return 'Subscriptions & Entertainment';
  }

  // 9. Utilities & Bills
  const utilityKeywords = ['electricity', 'power', 'water', 'comcast', 'verizon', 'att', 't-mobile', 'recharge', 'telecom', 'insurance', 'gas', 'bill payment', 'jio', 'airtel', 'act fibernet', 'broadband'];
  if (utilityKeywords.some(kw => fullText.includes(kw) || merchantLower.includes(kw))) {
    return 'Utilities & Bills';
  }

  return 'Other';
}

/**
 * Extracts expense amount and currency
 */
function extractAmountAndCurrency(subject, snippet, body) {
  const searchTexts = [subject, snippet, body].filter(Boolean);
  
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
        const context = text.slice(Math.max(0, index - 5), Math.min(text.length, index + match[1].length + 5));
        let currency = 'USD'; // Default fallback
        if (context.includes('₹') || context.toLowerCase().includes('rs') || context.toLowerCase().includes('inr')) {
          currency = 'INR';
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

  // Extract amount and currency
  const amountDetails = extractAmountAndCurrency(subject, snippet, body);
  if (!amountDetails) {
    return null; // Skip if no amount is found
  }

  // Extract merchant
  const merchant = normalizeMerchant(subject + ' ' + snippet, from);
  
  // Extract category (using full subject and body context)
  const category = getCategoryByContent(subject, snippet, body, merchant);

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

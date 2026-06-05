const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { Config } = require('./db');

const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

// Gmail Readonly scope
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

/**
 * Helper to fetch Google Client credentials (ENV -> DB -> Local File)
 */
async function getCredentials() {
  // 1. Check Env Variables (Recommended for secure cloud hosting)
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/callback';
    return {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uris: [redirectUri]
    };
  }

  // 2. Check Database
  try {
    const configDoc = await Config.findOne({ key: 'google_credentials' });
    if (configDoc && configDoc.value) {
      const web = configDoc.value.web || configDoc.value.installed || configDoc.value;
      return web;
    }
  } catch (err) {
    console.error('Error reading credentials from DB:', err.message);
  }

  // 3. Fallback to local files
  if (fs.existsSync(CREDENTIALS_PATH)) {
    try {
      const content = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
      const credentials = JSON.parse(content);
      return credentials.web || credentials.installed || credentials;
    } catch (e) {
      console.error('Error parsing credentials.json:', e.message);
    }
  }

  return null;
}

/**
 * Get OAuth2 client instance if credentials exist
 */
async function getOAuthClient() {
  const creds = await getCredentials();
  if (!creds) {
    return null;
  }
  
  return new google.auth.OAuth2(
    creds.client_id,
    creds.client_secret,
    creds.redirect_uris[0]
  );
}

/**
 * Checks if client is fully authenticated (via DB or files)
 */
async function isClientAuthenticated() {
  const oauth2Client = await getOAuthClient();
  if (!oauth2Client) return false;

  const tokens = await getTokens();
  return !!tokens;
}

/**
 * Helper to fetch session tokens (DB -> Local File)
 */
async function getTokens() {
  // 1. Check Database
  try {
    const tokenDoc = await Config.findOne({ key: 'google_oauth_tokens' });
    if (tokenDoc && tokenDoc.value) {
      return tokenDoc.value;
    }
  } catch (err) {
    console.error('Error reading tokens from DB:', err.message);
  }

  // 2. Fallback to local file
  if (fs.existsSync(TOKEN_PATH)) {
    try {
      const tokenContent = fs.readFileSync(TOKEN_PATH, 'utf8');
      return JSON.parse(tokenContent);
    } catch (e) {
      console.error('Error parsing token.json:', e.message);
    }
  }

  return null;
}

/**
 * Get authentication URL
 */
async function getAuthUrl() {
  const oauth2Client = await getOAuthClient();
  if (!oauth2Client) {
    throw new Error('Google OAuth credentials not configured. Please set them up first.');
  }

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'select_account' // Forces refresh token to be generated
  });
}

/**
 * Exchanging authorization code for token and persisting it
 */
async function saveToken(code) {
  const oauth2Client = await getOAuthClient();
  if (!oauth2Client) {
    throw new Error('Google OAuth credentials not configured.');
  }

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  
  // Save tokens to MongoDB (cloud persistence)
  try {
    await Config.findOneAndUpdate(
      { key: 'google_oauth_tokens' },
      { value: tokens },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error('Failed to save tokens to database:', err.message);
  }

  // Write locally for development convenience
  try {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  } catch (e) {
    console.warn('Could not write local token.json fallback:', e.message);
  }

  return tokens;
}

/**
 * Load saved credentials and return authenticated OAuth2 client
 */
async function getAuthenticatedClient() {
  const oauth2Client = await getOAuthClient();
  if (!oauth2Client) return null;

  const tokens = await getTokens();
  if (!tokens) return null;
  
  oauth2Client.setCredentials(tokens);

  // Set up auto-refresh handling
  oauth2Client.on('tokens', async (newTokens) => {
    try {
      const currentTokens = await getTokens();
      const mergedTokens = { ...currentTokens, ...newTokens };
      
      // Update database
      await Config.findOneAndUpdate(
        { key: 'google_oauth_tokens' },
        { value: mergedTokens },
        { upsert: true }
      );

      // Update local file fallback
      try {
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(mergedTokens, null, 2));
      } catch (err) {
        console.warn('Could not save auto-refreshed token.json:', err.message);
      }
    } catch (err) {
      console.error('Failed to handle auto-token-refresh:', err.message);
    }
  });

  return oauth2Client;
}

/**
 * Helper to recursively decode the body from Gmail message payload
 */
function getEmailBody(payload) {
  let body = '';
  if (payload.body && payload.body.data) {
    body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
  } else if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body && part.body.data) {
        body += Buffer.from(part.body.data, 'base64').toString('utf-8');
      } else if (part.mimeType === 'text/html' && part.body && part.body.data) {
        body += Buffer.from(part.body.data, 'base64').toString('utf-8');
      } else if (part.parts) {
        body += getEmailBody(part);
      }
    }
  }
  return body;
}

/**
 * Fetch messages matching query from Gmail API
 */
async function fetchTransactionEmails(query = '', maxResults = 500) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    throw new Error('User is not authenticated. Please log in.');
  }

  const gmail = google.gmail({ version: 'v1', auth });
  
  // Default query targeting standard receipt keywords after Jan 1, 2026
  const finalQuery = query || 'subject:(receipt OR order OR payment OR transaction OR invoice OR bill OR spent OR debited OR confirmed) after:2026/01/01';
  
  console.log(`Searching Gmail with query: "${finalQuery}"`);
  
  let messages = [];
  let pageToken = null;
  
  try {
    do {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: finalQuery,
        maxResults: Math.min(100, maxResults - messages.length),
        pageToken
      });
      
      const pageMessages = response.data.messages || [];
      messages = messages.concat(pageMessages);
      pageToken = response.data.nextPageToken;
      
      if (messages.length >= maxResults || !pageToken) {
        break;
      }
    } while (pageToken);
  } catch (err) {
    console.error('Error listing Gmail messages:', err.message);
    throw err;
  }

  console.log(`Found ${messages.length} total messages matching query.`);

  const parsedEmails = [];
  
  for (const message of messages) {
    try {
      const msgDetails = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full'
      });

      const payload = msgDetails.data.payload;
      const headers = payload.headers;
      
      const subjectHeader = headers.find(h => h.name.toLowerCase() === 'subject');
      const fromHeader = headers.find(h => h.name.toLowerCase() === 'from');
      const dateHeader = headers.find(h => h.name.toLowerCase() === 'date');
      
      const subject = subjectHeader ? subjectHeader.value : '';
      const from = fromHeader ? fromHeader.value : '';
      const date = dateHeader ? dateHeader.value : '';
      const snippet = msgDetails.data.snippet || '';
      
      const body = getEmailBody(payload);

      parsedEmails.push({
        id: message.id,
        subject,
        from,
        date,
        snippet,
        body
      });
    } catch (err) {
      console.error(`Error fetching detail for message ${message.id}:`, err.message);
    }
  }

  return parsedEmails;
}

module.exports = {
  getOAuthClient,
  isClientAuthenticated,
  getAuthUrl,
  saveToken,
  fetchTransactionEmails,
  CREDENTIALS_PATH,
  TOKEN_PATH
};

const crypto = require('crypto');

const CLIENT_ID = 'teacher-local';
const CLIENT_SECRET = 'dev_secret_change_in_production_32chars';
const API_URL = 'https://question-bank-api-6viq.onrender.com/v1';

const timestamp = Math.floor(Date.now() / 1000).toString();
const nonce = crypto.randomBytes(16).toString('hex');
const message = `${CLIENT_ID}:${timestamp}:${nonce}`;
const signature = crypto.createHmac('sha256', CLIENT_SECRET).update(message).digest('hex');

fetch(`${API_URL}/embed/sso/embed-token`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Client-Id': CLIENT_ID, 'X-Timestamp': timestamp, 'X-Nonce': nonce, 'X-Signature': signature },
  body: JSON.stringify({ user_id: '1', user_name: 'Admin', role: 'super_admin' })
}).then(r => r.json()).then(r => console.log('SUCCESS:', r)).catch(e => console.error('ERROR:', e));

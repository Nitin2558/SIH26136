/**
 * 2Factor.in Real Mobile SMS & Voice Call OTP Authentication Service
 * Secure backend-only gateway with zero client-side secret exposure
 */

const https = require('https');

const TWOFACTOR_BASE_URL = process.env.TWOFACTOR_BASE_URL || 'https://2factor.in/API/V1';
const TWOFACTOR_OTP_TEMPLATE = process.env.TWOFACTOR_OTP_TEMPLATE || '';

// In-memory rate limiting map: phone -> lastSentTimestamp
const otpRateLimitMap = new Map();
const COOLDOWN_SECONDS = 30;

// In-memory verification attempts tracking: sessionId -> attemptCount
const otpVerifyAttemptsMap = new Map();
const MAX_VERIFY_ATTEMPTS = 5;

/**
 * Get 2Factor API Key safely from environment
 */
function getApiKey() {
  const key = process.env.TWOFACTOR_API_KEY;
  if (!key || !key.trim()) {
    throw new Error('SMS service is not configured. Please set TWOFACTOR_API_KEY on the server.');
  }
  return key.trim();
}

/**
 * Clean & validate 10-digit Indian mobile numbers
 * Handles: "+91 9876543210", "09876543210", "98765-43210"
 */
function cleanPhoneNumber(rawPhone) {
  if (!rawPhone) {
    throw new Error('Mobile number is required.');
  }

  let cleaned = String(rawPhone).replace(/\D/g, '');

  // Strip leading 91 or 0
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }

  // Verify 10 digits & valid Indian mobile starting digits (6, 7, 8, 9)
  if (cleaned.length !== 10) {
    throw new Error('Please enter a valid 10-digit Indian mobile number.');
  }

  if (!/^[6-9]\d{9}$/.test(cleaned)) {
    throw new Error('Invalid mobile number: Indian mobile numbers must start with 6, 7, 8, or 9.');
  }

  return cleaned;
}

/**
 * Make an HTTPS GET request to 2Factor.in API
 */
function request2Factor(endpoint) {
  return new Promise((resolve, reject) => {
    let apiKey;
    try {
      apiKey = getApiKey();
    } catch (err) {
      return reject(err);
    }

    const baseUrl = (process.env.TWOFACTOR_BASE_URL || TWOFACTOR_BASE_URL).replace(/\/+$/, '');
    const url = `${baseUrl}/${apiKey}/${endpoint}`;

    https.get(url, (res) => {
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse 2Factor API response`));
        }
      });
    }).on('error', (err) => {
      reject(new Error(`2Factor Network Error: ${err.message}`));
    });
  });
}

/**
 * Send real SMS OTP to mobile number via 2Factor SMS AUTOGEN
 */
async function sendSMSOTP(rawPhone) {
  const phone = cleanPhoneNumber(rawPhone);

  // Anti-spam Cooldown Check
  const now = Date.now();
  const lastSent = otpRateLimitMap.get(phone);
  if (lastSent && (now - lastSent) < (COOLDOWN_SECONDS * 1000)) {
    const remainingSecs = Math.ceil((COOLDOWN_SECONDS * 1000 - (now - lastSent)) / 1000);
    return {
      success: false,
      cooldown: true,
      remainingSecs,
      error: `Please wait ${remainingSecs}s before requesting a new OTP.`
    };
  }

  try {
    const templatePart = TWOFACTOR_OTP_TEMPLATE ? `/${TWOFACTOR_OTP_TEMPLATE}` : '';
    const endpoint = `SMS/+91${phone}/AUTOGEN${templatePart}`;
    console.log(`[2Factor] Dispatching real SMS OTP to +91 ${phone.slice(0, 3)}****${phone.slice(-3)}...`);
    const response = await request2Factor(endpoint);

    if (response.Status === 'Success') {
      otpRateLimitMap.set(phone, now);
      console.log(`[2Factor] SMS OTP dispatched successfully. Session ID: ${response.Details}`);
      return {
        success: true,
        sessionId: response.Details,
        phone,
        method: 'sms',
        message: `OTP sent via SMS to +91 ${phone}`
      };
    } else {
      console.error('[2Factor Error] Dispatch failed:', response.Details);
      return {
        success: false,
        error: response.Details || 'Failed to dispatch SMS OTP. Please check mobile number.'
      };
    }
  } catch (err) {
    console.error('[2Factor Exception]', err.message);
    return {
      success: false,
      error: 'SMS service temporarily unavailable. Please try again in a few moments.'
    };
  }
}

/**
 * Send real Voice Call OTP to mobile number via 2Factor VOICE AUTOGEN
 */
async function sendVoiceOTP(rawPhone) {
  const phone = cleanPhoneNumber(rawPhone);

  // Anti-spam Cooldown Check
  const now = Date.now();
  const lastSent = otpRateLimitMap.get(phone);
  if (lastSent && (now - lastSent) < (COOLDOWN_SECONDS * 1000)) {
    const remainingSecs = Math.ceil((COOLDOWN_SECONDS * 1000 - (now - lastSent)) / 1000);
    return {
      success: false,
      cooldown: true,
      remainingSecs,
      error: `Please wait ${remainingSecs}s before requesting another call.`
    };
  }

  try {
    // 2Factor Voice endpoint accepts 10-digit number
    const endpoint = `VOICE/${phone}/AUTOGEN`;
    console.log(`[2Factor] Initiating automated Voice OTP Call to +91 ${phone.slice(0, 3)}****${phone.slice(-3)}...`);
    const response = await request2Factor(endpoint);

    if (response.Status === 'Success') {
      otpRateLimitMap.set(phone, now);
      console.log(`[2Factor] Voice OTP Call triggered. Session ID: ${response.Details}`);
      return {
        success: true,
        sessionId: response.Details,
        phone,
        method: 'voice',
        message: `Calling +91 ${phone}... Please answer your phone to hear the 6-digit OTP code.`
      };
    } else {
      console.error('[2Factor Voice Error]', response.Details);
      return {
        success: false,
        error: response.Details || 'Failed to place Voice OTP call. Please try SMS instead.'
      };
    }
  } catch (err) {
    console.error('[2Factor Voice Exception]', err.message);
    return {
      success: false,
      error: 'Voice call service temporarily unavailable. Please try SMS instead.'
    };
  }
}

/**
 * Verify SMS OTP via 2Factor SMS VERIFY endpoint
 */
async function verifySMSOTP(sessionId, rawOtp) {
  if (!sessionId) {
    return { success: false, error: 'Session ID is missing or expired. Please request a new OTP.' };
  }

  const attempts = (otpVerifyAttemptsMap.get(sessionId) || 0) + 1;
  otpVerifyAttemptsMap.set(sessionId, attempts);

  if (attempts > MAX_VERIFY_ATTEMPTS) {
    return {
      success: false,
      error: 'Maximum verification attempts exceeded. Please request a new OTP.'
    };
  }

  const otp = String(rawOtp || '').trim();
  if (!otp || !/^\d{4,6}$/.test(otp)) {
    return { success: false, error: 'Please enter a valid numeric OTP.' };
  }

  try {
    const endpoint = `SMS/VERIFY/${sessionId}/${otp}`;
    const response = await request2Factor(endpoint);

    if (response.Status === 'Success' && response.Details === 'OTP Matched') {
      otpVerifyAttemptsMap.delete(sessionId);
      return { success: true, message: 'OTP verified successfully' };
    } else {
      const remainingAttempts = MAX_VERIFY_ATTEMPTS - attempts;
      const attemptWarning = remainingAttempts > 0 
        ? ` (${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining)` 
        : '';
      const errMsg = response.Details === 'OTP Expired' 
        ? 'OTP has expired. Please request a new OTP.' 
        : `Invalid verification code. Please check and try again.${attemptWarning}`;
      return {
        success: false,
        error: errMsg
      };
    }
  } catch (err) {
    console.error('[2Factor Verify Exception]', err.message);
    return {
      success: false,
      error: 'Failed to verify OTP. Please try again.'
    };
  }
}

/**
 * Verify Voice OTP via 2Factor VOICE VERIFY endpoint
 */
async function verifyVoiceOTP(sessionId, rawOtp) {
  if (!sessionId) {
    return { success: false, error: 'Session ID is missing or expired.' };
  }

  const otp = String(rawOtp || '').trim();
  if (!otp || !/^\d{4,6}$/.test(otp)) {
    return { success: false, error: 'Please enter a valid numeric OTP.' };
  }

  try {
    const endpoint = `VOICE/VERIFY/${sessionId}/${otp}`;
    const response = await request2Factor(endpoint);

    if (response.Status === 'Success' && response.Details === 'OTP Matched') {
      return { success: true, message: 'OTP verified successfully' };
    } else {
      return {
        success: false,
        error: response.Details || 'Invalid OTP. Please check and try again.'
      };
    }
  } catch (err) {
    console.error('[2Factor Voice Verify Exception]', err.message);
    return {
      success: false,
      error: 'Failed to verify OTP. Please try again.'
    };
  }
}

/**
 * Unified Send OTP (method: 'sms' | 'voice')
 */
async function sendOTP(rawPhone, method = 'sms') {
  if (method === 'voice') {
    return await sendVoiceOTP(rawPhone);
  }
  return await sendSMSOTP(rawPhone);
}

/**
 * Unified Verify OTP: checks specified method, with graceful cross-method fallback
 */
async function verifyOTP(sessionId, rawOtp, method = 'sms') {
  if (method === 'voice') {
    const voiceRes = await verifyVoiceOTP(sessionId, rawOtp);
    if (voiceRes.success) return voiceRes;
    // Fallback try SMS if voice session mismatch
    return await verifySMSOTP(sessionId, rawOtp);
  } else {
    const smsRes = await verifySMSOTP(sessionId, rawOtp);
    if (smsRes.success) return smsRes;
    // Fallback try Voice if SMS session failover occurred
    return await verifyVoiceOTP(sessionId, rawOtp);
  }
}

/**
 * Check remaining SMS and Voice balances
 */
async function getBalances() {
  try {
    const [sms, voice] = await Promise.all([
      request2Factor('BAL/SMS').catch(e => ({ Status: 'Error', Details: e.message })),
      request2Factor('BAL/VOICE').catch(e => ({ Status: 'Error', Details: e.message }))
    ]);
    return {
      smsBalance: sms.Details,
      voiceBalance: voice.Details
    };
  } catch (err) {
    return { error: err.message };
  }
}

module.exports = {
  cleanPhoneNumber,
  sendSMSOTP,
  sendVoiceOTP,
  sendOTP,
  verifySMSOTP,
  verifyVoiceOTP,
  verifyOTP,
  getBalances
};

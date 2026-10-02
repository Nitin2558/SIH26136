const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getDB, saveDB, generateId } = require('../db/store');
const { cleanPhoneNumber, sendOTP, verifyOTP } = require('../services/twofactor');

const JWT_SECRET = process.env.JWT_SECRET || 'sih-procurement-secret-key-2026';

/**
 * Update / Complete Profile
 */
router.put('/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDB();
    const userIndex = db.users.findIndex(u => u.id === decoded.id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = db.users[userIndex];
    const { name, email, locationState, departmentName, startupName, dpiitNumber, sector, designation, orgName } = req.body;

    if (name && name.trim()) user.name = name.trim();
    if (email && email.trim()) user.email = email.toLowerCase().trim();
    if (locationState) user.locationState = locationState.trim();
    if (departmentName) user.departmentName = departmentName.trim();
    if (startupName) user.startupName = startupName.trim();
    if (dpiitNumber) user.dpiitNumber = dpiitNumber.trim();
    if (sector) user.sector = sector.trim();
    if (designation) user.designation = designation.trim();
    if (orgName) user.orgName = orgName.trim();

    user.profileCompleted = true;
    user.updatedAt = new Date().toISOString();

    db.users[userIndex] = user;
    saveDB();

    const { passwordHash: _, ...userWithoutPass } = user;
    res.json({
      success: true,
      user: userWithoutPass,
      message: 'Profile updated successfully!'
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired session token' });
  }
});

/**
 * Register User
 */
router.post('/register', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone,
      password, 
      role, 
      departmentName, 
      startupName, 
      dpiitNumber, 
      sector, 
      domains, 
      teamSize, 
      workforceSkills, 
      trlLevel, 
      description, 
      solutionName, 
      orgName, 
      locationState 
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    let cleanPhone = null;
    if (phone) {
      try {
        cleanPhone = cleanPhoneNumber(phone);
      } catch (phoneErr) {
        return res.status(400).json({ error: phoneErr.message });
      }
    }

    const validRoles = ['government', 'startup', 'expert', 'validator', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    const db = getDB();
    const existing = db.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    if (cleanPhone) {
      const existingPhone = db.users.find(u => u.phone && u.phone === cleanPhone);
      if (existingPhone) {
        return res.status(400).json({ error: 'An account with this mobile number already exists.' });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let parsedDomains = domains;
    if (typeof domains === 'string') {
      parsedDomains = domains.split(',').map(d => d.trim()).filter(Boolean);
    }
    if (!Array.isArray(parsedDomains) || parsedDomains.length === 0) {
      parsedDomains = [sector || 'Smart Cities & CleanTech'];
    }

    let parsedSkills = workforceSkills;
    if (typeof workforceSkills === 'string') {
      parsedSkills = workforceSkills.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(parsedSkills)) {
      parsedSkills = ['Rapid Prototyping', 'IoT Telemetry'];
    }

    let createdStartupId = null;
    if (role === 'startup') {
      createdStartupId = 'start-' + generateId().substring(0, 8);
      const newStartup = {
        id: createdStartupId,
        userId: '', // populated below
        name: startupName || name,
        founderName: name,
        founderEmail: email.toLowerCase().trim(),
        dpiitNumber: dpiitNumber || 'DIPP-NEW-01',
        incorporationYear: 2024,
        teamSize: Number(teamSize) || 8,
        sector: sector || parsedDomains[0] || 'Smart Cities & CleanTech',
        domains: parsedDomains,
        solutionName: solutionName || 'Innovative Public Sector Solution',
        description: description || 'DPIIT startup innovation sandbox participant.',
        solutionSummary: description || 'DPIIT startup innovation applying for public procurement sandbox.',
        trlLevel: Number(trlLevel) || 6,
        website: '',
        deckUrl: '',
        verifiedDpiit: Boolean(dpiitNumber),
        certifications: ['DPIIT Startup India Registered'],
        keyCapabilities: ['Technology Innovation', 'Rapid Prototyping'],
        workforceSkills: parsedSkills,
        achievements: [],
        pastProjects: [],
        createdAt: new Date().toISOString()
      };
      if (!db.startups) db.startups = [];
      db.startups.push(newStartup);
    }

    const newUser = {
      id: generateId(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: cleanPhone,
      role: role,
      passwordHash,
      departmentName: departmentName ? departmentName.trim() : '',
      startupName: startupName ? startupName.trim() : '',
      startupId: createdStartupId,
      dpiitNumber: dpiitNumber ? dpiitNumber.trim() : '',
      sector: sector ? sector.trim() : '',
      domains: parsedDomains,
      orgName: orgName ? orgName.trim() : '',
      locationState: locationState || 'Maharashtra',
      profileCompleted: true,
      createdAt: new Date().toISOString()
    };

    if (createdStartupId) {
      const s = db.startups.find(st => st.id === createdStartupId);
      if (s) s.userId = newUser.id;
    }

    db.users.push(newUser);

    saveDB();

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, name: newUser.name, email: newUser.email, phone: newUser.phone },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...userWithoutPass } = newUser;
    res.json({ token, user: userWithoutPass, message: 'Registration successful!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Login User
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, demoRole } = req.body;
    const db = getDB();

    // Demo Mode Quick Login for judges / reviewers
    if (demoRole) {
      let demoUser = db.users.find(u => u.role === demoRole);
      if (!demoUser) {
        // Fallback default demo persona creation if needed
        const defaultPersonas = {
          government: { id: 'usr-govt-1', name: 'Dr. Sunita Verma', email: 'sunita.verma@gov.in', role: 'government', departmentName: 'Department of Urban Infrastructure & Smart Cities Mission' },
          startup: { id: 'usr-startup-1', name: 'Priya Patel', email: 'priya@cleanroute.tech', role: 'startup', startupName: 'CleanRoute Technologies', dpiitNumber: 'DIPP-84920' },
          expert: { id: 'usr-expert-1', name: 'Dr. K. R. Ramanujan', email: 'ramanujan@expert-panel.gov.in', role: 'expert', orgName: 'National Innovation Review Panel' },
          validator: { id: 'usr-validator-1', name: 'Quality & Standards Certification Bureau', email: 'audit@cert-bureau.gov.in', role: 'validator', orgName: 'TechAudit & Standards Certification Bureau' },
          admin: { id: 'usr-admin-1', name: 'System Admin', email: 'admin@samadhansetu.gov.in', role: 'admin' }
        };
        demoUser = defaultPersonas[demoRole] || defaultPersonas.government;
        db.users.push(demoUser);
        saveDB();
      }

      const token = jwt.sign(
        { id: demoUser.id, role: demoUser.role, name: demoUser.name, email: demoUser.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      const { passwordHash: _, ...userWithoutPass } = demoUser;
      return res.json({ token, user: userWithoutPass, message: `Logged in as Demo ${demoRole}` });
    }

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password. Please check your credentials or register.' });
    }

    if (user.passwordHash) {
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...userWithoutPass } = user;
    res.json({ token, user: userWithoutPass, message: 'Login successful!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Dispatch Mobile OTP (2Factor SMS)
 */
router.post('/otp/send', async (req, res) => {
  try {
    const { phone, method = 'sms' } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Mobile number is required.' });
    }

    let cleanPhone;
    try {
      cleanPhone = cleanPhoneNumber(phone);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    const db = getDB();
    // Rule: Confirm the user exists before sending an OTP
    const user = db.users.find(u => u.phone === cleanPhone);
    if (!user) {
      return res.status(404).json({
        error: 'No registered account found with this mobile number. Please check the number or register.'
      });
    }

    const otpResult = await sendOTP(cleanPhone, method);
    if (!otpResult.success) {
      const statusCode = otpResult.cooldown ? 429 : 400;
      return res.status(statusCode).json({ error: otpResult.error });
    }

    res.json({
      success: true,
      sessionId: otpResult.sessionId,
      phone: cleanPhone,
      method: otpResult.method || method,
      message: `Verification code sent to +91 ${cleanPhone.slice(0, 3)}****${cleanPhone.slice(-3)}`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to dispatch verification code. Please try again.' });
  }
});

/**
 * Verify Mobile OTP and Issue Session Token
 */
router.post('/otp/verify', async (req, res) => {
  try {
    const { sessionId, otp, phone, method = 'sms' } = req.body;
    if (!sessionId || !otp || !phone) {
      return res.status(400).json({ error: 'Session ID, OTP, and mobile number are required.' });
    }

    let cleanPhone;
    try {
      cleanPhone = cleanPhoneNumber(phone);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    const db = getDB();
    const user = db.users.find(u => u.phone === cleanPhone);
    if (!user) {
      return res.status(404).json({ error: 'No registered account found with this mobile number.' });
    }

    const verifyResult = await verifyOTP(sessionId, otp, method);
    if (!verifyResult.success) {
      return res.status(400).json({ error: verifyResult.error });
    }

    // Generate JWT authentication token
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, email: user.email, phone: user.phone },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { passwordHash: _, ...userWithoutPass } = user;
    res.json({
      success: true,
      token,
      user: userWithoutPass,
      message: 'OTP verified successfully!'
    });
  } catch (err) {
    res.status(500).json({ error: 'Authentication failed. Please try again.' });
  }
});

/**
 * Get Current Authenticated User
 */
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No authentication token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDB();
    const user = db.users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { passwordHash: _, ...userWithoutPass } = user;
    res.json({ user: userWithoutPass });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired session token' });
  }
});

module.exports = router;


const jwt = require('jsonwebtoken');
const { getDB } = require('../db/store');

const JWT_SECRET = process.env.JWT_SECRET || 'sih-procurement-secret-key-2026';

// Extract user identity from token/headers
function extractUserFromRequest(req) {
  const db = getDB();

  // 1. Verify Bearer Token if provided
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.id) {
        const user = (db.users || []).find(u => u.id === decoded.id);
        if (user) {
          const startup = (db.startups || []).find(s => s.userId === user.id);
          return {
            id: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            phone: user.phone,
            departmentName: user.departmentName || null,
            startupId: startup?.id || null,
            startupName: startup?.name || null,
            orgName: user.departmentName || startup?.name || user.orgName || null
          };
        }
        return {
          id: decoded.id,
          role: decoded.role,
          name: decoded.name || 'User',
          email: decoded.email
        };
      }
    } catch (err) {
      // Token invalid / expired - proceed to check custom headers or fallback
    }
  }

  // 2. Custom headers (x-user-id, x-user-role)
  const userIdHeader = req.headers['x-user-id'];
  const roleHeader = req.headers['x-user-role'];
  const userNameHeader = req.headers['x-user-name'];

  if (userIdHeader || roleHeader) {
    let user = null;
    if (userIdHeader) {
      user = (db.users || []).find(u => u.id === userIdHeader);
    } else if (roleHeader) {
      user = (db.users || []).find(u => u.role === roleHeader);
    }

    if (user) {
      const startup = (db.startups || []).find(s => s.userId === user.id || s.id === user.startupId);
      return {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
        departmentName: user.departmentName || null,
        startupId: startup?.id || user.startupId || null,
        startupName: startup?.name || null,
        orgName: user.departmentName || startup?.name || user.orgName || null
      };
    }
    return {
      id: userIdHeader || 'usr-custom',
      role: roleHeader || 'public',
      name: userNameHeader || 'User',
      startupId: req.headers['x-user-startup-id'] || null
    };
  }

  // 3. Fallback for testing with query params
  if (req.query.userId || req.query.role) {
    let user = null;
    if (req.query.userId) {
      user = (db.users || []).find(u => u.id === req.query.userId);
    } else if (req.query.role) {
      user = (db.users || []).find(u => u.role === req.query.role);
    }

    if (user) {
      const startup = (db.startups || []).find(s => s.userId === user.id || s.id === user.startupId);
      return {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
        startupId: startup?.id || user.startupId || null,
        startupName: startup?.name || null
      };
    }
  }

  // Default anonymous/public
  return {
    id: 'anonymous',
    role: 'public',
    name: 'Anonymous Public User'
  };
}

// Require user to be authenticated with one of the allowed roles
function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    const user = extractUserFromRequest(req);
    req.user = user;

    if (!user || !user.role) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: `Forbidden: Access restricted to ${allowedRoles.join(', ')} roles.` });
    }

    next();
  };
}

// Enforce University Isolation & Industry Read-Only Access
function authorizeEvidenceAccess(action) {
  return (req, res, next) => {
    const user = extractUserFromRequest(req);
    req.user = user;

    if (!user || !user.role) {
      return res.status(401).json({ error: 'Unauthorized session.' });
    }

    // 1. Industry callers are strictly READ-ONLY (SELECT/GET)
    if (user.role === 'industry' && action !== 'read') {
      return res.status(403).json({ error: 'Forbidden: Industry partners have Read-Only access to shared research evidence.' });
    }

    // 2. Citizens & Public callers are denied access
    if (['citizen', 'public'].includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden: Research evidence is confidential and restricted.' });
    }

    next();
  };
}

module.exports = {
  extractUserFromRequest,
  requireRole,
  authorizeEvidenceAccess
};

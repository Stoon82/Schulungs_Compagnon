import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const adminSessions = new Map();

function generateAdminToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Export function to store sessions (used by sessionManagement.js)
export function storeAdminSession(token, sessionData) {
  adminSessions.set(token, sessionData);
}

export function adminLogin(req, res) {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      success: false,
      error: 'Password is required'
    });
  }

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      error: 'Invalid password'
    });
  }

  const token = generateAdminToken();
  const expiresAt = Date.now() + ADMIN_SESSION_DURATION;

  adminSessions.set(token, {
    createdAt: Date.now(),
    expiresAt,
    lastActivity: Date.now()
  });

  res.json({
    success: true,
    data: {
      token,
      expiresAt
    }
  });
}

export function adminLogout(req, res) {
  const token = req.adminToken;
  
  if (token) {
    adminSessions.delete(token);
  }

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}

export function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Admin authentication required'
    });
  }

  const token = authHeader.substring(7);
  const session = adminSessions.get(token);

  if (!session) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired admin session'
    });
  }

  if (Date.now() > session.expiresAt) {
    adminSessions.delete(token);
    return res.status(401).json({
      success: false,
      error: 'Admin session expired'
    });
  }

  session.lastActivity = Date.now();
  req.adminToken = token;
  next();
}

export function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of adminSessions.entries()) {
    if (now > session.expiresAt) {
      adminSessions.delete(token);
    }
  }
}

setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

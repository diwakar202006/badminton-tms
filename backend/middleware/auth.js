const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the JWT and attaches the user to req.user. Viewer-only routes do
// not use this middleware at all - they stay public.
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
  }
};

// Usage: authorize('central_scorer') or authorize('central_scorer', 'court_scorer')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: insufficient role permissions' });
  }
  next();
};

// Ensures a court_scorer can only touch their own assigned court.
// Expects the court number as req.params.courtNumber or in the match doc (req.match).
const enforceCourtOwnership = (req, res, next) => {
  if (req.user.role === 'central_scorer') return next(); // central can act on any court

  const requestedCourt = Number(req.params.courtNumber || req.body.court || req.match?.court);
  if (req.user.assignedCourt !== requestedCourt) {
    return res.status(403).json({ message: 'Forbidden: you can only manage your assigned court' });
  }
  next();
};

module.exports = { protect, authorize, enforceCourtOwnership };

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// POST /api/auth/register
// In production this should be restricted (e.g. only central_scorer can create
// court_scorer accounts). Left open here for MVP setup convenience but guarded
// by requiring a central_scorer token when creating another central_scorer.
const register = async (req, res) => {
  try {
    const { name, email, password, role, assignedCourt } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password and role are required' });
    }
    if (!['central_scorer', 'court_scorer'].includes(role)) {
      return res.status(400).json({ message: 'role must be central_scorer or court_scorer' });
    }
    if (role === 'court_scorer' && !assignedCourt) {
      return res.status(400).json({ message: 'assignedCourt (1-6) is required for court_scorer' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'A user with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      assignedCourt: role === 'court_scorer' ? assignedCourt : null,
    });

    const token = signToken(user);
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

// GET /api/auth/me
const me = async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
};

module.exports = { login, register, me };

const express = require('express');
const { login, register, me } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/register', register); // used by seed script / central scorer to create accounts
router.get('/me', protect, me);

module.exports = router;

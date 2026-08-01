const express = require('express');
const { getAllCourts, getCourtByNumber } = require('../controllers/courtController');

const router = express.Router();

// Public - used by Home, Central Dashboard, and Viewer pages
router.get('/', getAllCourts);
router.get('/:number', getCourtByNumber);

module.exports = router;

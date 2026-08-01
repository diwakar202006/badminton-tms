const express = require('express');
const {
  createMatch,
  assignMatch,
  listMatches,
  getMatch,
  loadMatchForCourtAction,
  setPositions,
  setFirstServer,
  startMatch,
  scorePoint,
  undoLastAction,
  pauseMatch,
  resumeMatch,
  finishMatch,
} = require('../controllers/matchController');
const { protect, authorize, enforceCourtOwnership } = require('../middleware/auth');

const router = express.Router();

// Public - viewer mode, fixtures, results, live scores
router.get('/', listMatches);
router.get('/:id', getMatch);

// Central Scorer only
router.post('/', protect, authorize('central_scorer'), createMatch);
router.patch('/:id/assign', protect, authorize('central_scorer'), assignMatch);

// Court Scorer (own court only) or Central Scorer
const courtAction = [protect, authorize('central_scorer', 'court_scorer'), loadMatchForCourtAction, enforceCourtOwnership];

router.patch('/:id/positions', ...courtAction, setPositions);
router.patch('/:id/server', ...courtAction, setFirstServer);
router.patch('/:id/start', ...courtAction, startMatch);
router.patch('/:id/score', ...courtAction, scorePoint);
router.patch('/:id/undo', ...courtAction, undoLastAction);
router.patch('/:id/pause', ...courtAction, pauseMatch);
router.patch('/:id/resume', ...courtAction, resumeMatch);
router.patch('/:id/finish', ...courtAction, finishMatch);

module.exports = router;

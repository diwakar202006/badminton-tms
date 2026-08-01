const Match = require('../models/Match');
const Court = require('../models/Court');

// Broadcasts the full, freshly-populated courts list to every connected
// client (central dashboard, viewer pages, court scorer pages). Keeping one
// event shape for all audiences keeps the frontend simple for an MVP.
const broadcastCourts = async (io) => {
  const courts = await Court.find().sort({ number: 1 }).populate('currentMatch').populate('nextMatch');
  io.emit('courts:update', { courts });
};

const expectedPlayerCount = (type) => (type === 'singles' ? 1 : 2);

// POST /api/matches  (central_scorer only)
// Creates a match. If `court` is provided it is also assigned immediately,
// either as the court's current match (court must be idle) or, if
// `slot: 'next'` is passed, queued as that court's next match.
const createMatch = async (req, res) => {
  try {
    const { type, teamA, teamB, court, slot } = req.body;

    if (!['singles', 'doubles'].includes(type)) {
      return res.status(400).json({ message: 'type must be singles or doubles' });
    }
    const need = expectedPlayerCount(type);
    if (!teamA?.players || teamA.players.length !== need || !teamB?.players || teamB.players.length !== need) {
      return res.status(400).json({ message: `Each team needs exactly ${need} player(s) for ${type}` });
    }

    const match = await Match.create({
      type,
      teamA: { players: teamA.players },
      teamB: { players: teamB.players },
      createdBy: req.user._id,
    });

    if (court) {
      await assignMatchToCourt(match, Number(court), slot === 'next' ? 'next' : 'current');
    }

    await broadcastCourts(req.app.get('io'));
    res.status(201).json({ match });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create match', error: err.message });
  }
};

// Shared helper used by createMatch and assignMatch
async function assignMatchToCourt(match, courtNumber, slot) {
  const court = await Court.findOne({ number: courtNumber });
  if (!court) throw new Error('Court not found');

  if (slot === 'current') {
    if (court.status === 'occupied') {
      throw new Error('Court is busy. Use slot "next" to queue this match instead.');
    }
    court.currentMatch = match._id;
    court.status = 'occupied';
    match.court = courtNumber;
    match.status = 'assigned';
  } else {
    if (court.status !== 'occupied') {
      throw new Error('Court is idle - assign this match as the current match instead.');
    }
    if (court.nextMatch) {
      throw new Error('Court already has a next match queued.');
    }
    court.nextMatch = match._id;
    match.court = courtNumber;
    // status stays 'scheduled' until the court frees up and it is promoted
  }

  await court.save();
  await match.save();
}

// PATCH /api/matches/:id/assign  (central_scorer only)  body: { court, slot }
const assignMatch = async (req, res) => {
  try {
    const { court, slot } = req.body;
    if (!court) return res.status(400).json({ message: 'court is required' });

    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    if (['live', 'paused', 'finished'].includes(match.status)) {
      return res.status(400).json({ message: 'Match is already in progress or finished' });
    }

    await assignMatchToCourt(match, Number(court), slot === 'next' ? 'next' : 'current');
    await broadcastCourts(req.app.get('io'));
    res.json({ match });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/matches?status=scheduled|assigned|live|paused|finished (public)
const listMatches = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const matches = await Match.find(filter).sort({ createdAt: -1 });
    res.json({ matches });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch matches', error: err.message });
  }
};

// GET /api/matches/:id (public)
const getMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    res.json({ match });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch match', error: err.message });
  }
};

// Loads the match for req.params.id and checks the acting court scorer owns
// its court. Central scorers are allowed through in enforceCourtOwnership.
const loadMatchForCourtAction = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ message: 'Match not found' });
    if (!match.court) return res.status(400).json({ message: 'Match is not assigned to a court yet' });
    req.match = match;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Failed to load match', error: err.message });
  }
};

// PATCH /api/matches/:id/positions  body: { positions: {A1,A2,B1,B2} }
const setPositions = async (req, res) => {
  try {
    const match = req.match;
    if (match.status === 'finished') return res.status(400).json({ message: 'Match already finished' });

    const { positions } = req.body;
    match.positions = { ...match.positions.toObject(), ...positions };
    await match.save();

    await broadcastCourts(req.app.get('io'));
    res.json({ match });
  } catch (err) {
    res.status(500).json({ message: 'Failed to set positions', error: err.message });
  }
};

// PATCH /api/matches/:id/server  body: { player }
const setFirstServer = async (req, res) => {
  try {
    const match = req.match;
    const { player } = req.body;
    if (!player) return res.status(400).json({ message: 'player is required' });

    const validNames = [...match.teamA.players, ...match.teamB.players];
    if (!validNames.includes(player)) {
      return res.status(400).json({ message: 'Selected player is not in this match' });
    }

    match.firstServer = player;
    await match.save();

    await broadcastCourts(req.app.get('io'));
    res.json({ match });
  } catch (err) {
    res.status(500).json({ message: 'Failed to set first server', error: err.message });
  }
};

// PATCH /api/matches/:id/start
const startMatch = async (req, res) => {
  try {
    const match = req.match;
    if (match.status !== 'assigned') {
      return res.status(400).json({ message: 'Match must be in "assigned" state to start' });
    }
    if (!match.firstServer) {
      return res.status(400).json({ message: 'Select the first server before starting' });
    }
    const requiredSlots = match.type === 'singles' ? ['A1', 'B1'] : ['A1', 'A2', 'B1', 'B2'];
    const positions = match.positions.toObject();
    const missing = requiredSlots.filter((slot) => !positions[slot]);
    if (missing.length) {
      return res.status(400).json({ message: `Set player positions before starting (missing: ${missing.join(', ')})` });
    }

    match.status = 'live';
    match.startedAt = new Date();
    await match.save();

    await broadcastCourts(req.app.get('io'));
    res.json({ match });
  } catch (err) {
    res.status(500).json({ message: 'Failed to start match', error: err.message });
  }
};

// PATCH /api/matches/:id/score  body: { team: 'A' | 'B' }
const scorePoint = async (req, res) => {
  try {
    const match = req.match;
    if (match.status !== 'live') {
      return res.status(400).json({ message: 'Match must be live to update the score' });
    }
    const { team } = req.body;
    if (!['A', 'B'].includes(team)) return res.status(400).json({ message: 'team must be "A" or "B"' });

    match.history.push({
      teamA: match.score.teamA,
      teamB: match.score.teamB,
      action: `POINT_${team}`,
    });

    if (team === 'A') match.score.teamA += 1;
    else match.score.teamB += 1;

    await match.save();

    await broadcastCourts(req.app.get('io'));
    res.json({ match });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update score', error: err.message });
  }
};

// PATCH /api/matches/:id/undo
const undoLastAction = async (req, res) => {
  try {
    const match = req.match;
    if (!match.history.length) {
      return res.status(400).json({ message: 'Nothing to undo' });
    }
    const last = match.history.pop();
    match.score.teamA = last.teamA;
    match.score.teamB = last.teamB;
    await match.save();

    await broadcastCourts(req.app.get('io'));
    res.json({ match });
  } catch (err) {
    res.status(500).json({ message: 'Failed to undo', error: err.message });
  }
};

// PATCH /api/matches/:id/pause
const pauseMatch = async (req, res) => {
  try {
    const match = req.match;
    if (match.status !== 'live') return res.status(400).json({ message: 'Match is not live' });
    match.status = 'paused';
    await match.save();

    await broadcastCourts(req.app.get('io'));
    res.json({ match });
  } catch (err) {
    res.status(500).json({ message: 'Failed to pause match', error: err.message });
  }
};

// PATCH /api/matches/:id/resume
const resumeMatch = async (req, res) => {
  try {
    const match = req.match;
    if (match.status !== 'paused') return res.status(400).json({ message: 'Match is not paused' });
    match.status = 'live';
    await match.save();

    await broadcastCourts(req.app.get('io'));
    res.json({ match });
  } catch (err) {
    res.status(500).json({ message: 'Failed to resume match', error: err.message });
  }
};

// PATCH /api/matches/:id/finish
// Ends the match, records the winner, frees the court, and promotes the
// queued next match (if any) into the current match slot.
const finishMatch = async (req, res) => {
  try {
    const match = req.match;
    if (!['live', 'paused'].includes(match.status)) {
      return res.status(400).json({ message: 'Match must be live or paused to finish' });
    }
    if (match.score.teamA === match.score.teamB) {
      return res.status(400).json({ message: 'Scores are tied - cannot finish without a winner' });
    }

    match.status = 'finished';
    match.finishedAt = new Date();
    match.winner = match.score.teamA > match.score.teamB ? 'teamA' : 'teamB';
    await match.save();

    const court = await Court.findOne({ number: match.court });
    if (court) {
      if (court.nextMatch) {
        const promoted = await Match.findById(court.nextMatch);
        if (promoted) {
          promoted.status = 'assigned';
          await promoted.save();
        }
        court.currentMatch = court.nextMatch;
        court.nextMatch = null;
        court.status = 'occupied';
      } else {
        court.currentMatch = null;
        court.status = 'idle';
      }
      await court.save();
    }

    await broadcastCourts(req.app.get('io'));
    res.json({ match });
  } catch (err) {
    res.status(500).json({ message: 'Failed to finish match', error: err.message });
  }
};

module.exports = {
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
};

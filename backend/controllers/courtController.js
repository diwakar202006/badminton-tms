const Court = require('../models/Court');

// GET /api/courts
// Public endpoint (viewers + central dashboard) - returns all 6 courts with
// their current and next match populated. This is also the shape emitted
// over Socket.IO on every update so the frontend can reuse one renderer.
const getAllCourts = async (req, res) => {
  try {
    const courts = await Court.find()
      .sort({ number: 1 })
      .populate('currentMatch')
      .populate('nextMatch');
    res.json({ courts });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch courts', error: err.message });
  }
};

// GET /api/courts/:number
const getCourtByNumber = async (req, res) => {
  try {
    const court = await Court.findOne({ number: Number(req.params.number) })
      .populate('currentMatch')
      .populate('nextMatch');
    if (!court) return res.status(404).json({ message: 'Court not found' });
    res.json({ court });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch court', error: err.message });
  }
};

module.exports = { getAllCourts, getCourtByNumber };

const mongoose = require('mongoose');

// A single history entry lets the court scorer undo the last scoring action.
const historyEntrySchema = new mongoose.Schema(
  {
    teamA: { type: Number, required: true },
    teamB: { type: Number, required: true },
    action: { type: String, required: true }, // e.g. "POINT_A", "POINT_B"
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

// 2x2 court layout: top row is Team B's two service courts, bottom row is
// Team A's two service courts. For singles only the *_1 slots are used.
const positionsSchema = new mongoose.Schema(
  {
    A1: { type: String, default: null }, // Team A - right/near service court
    A2: { type: String, default: null }, // Team A - left/near service court (doubles only)
    B1: { type: String, default: null }, // Team B - right/far service court
    B2: { type: String, default: null }, // Team B - left/far service court (doubles only)
  },
  { _id: false }
);

const matchSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['singles', 'doubles'], required: true },

    teamA: {
      players: {
        type: [String],
        required: true,
        validate: {
          validator: function validatePlayers(arr) {
            return arr.length === (this.type === 'singles' ? 1 : 2);
          },
          message: 'Team A player count does not match match type',
        },
      },
    },
    teamB: {
      players: {
        type: [String],
        required: true,
        validate: {
          validator: function validatePlayers(arr) {
            return arr.length === (this.type === 'singles' ? 1 : 2);
          },
          message: 'Team B player count does not match match type',
        },
      },
    },

    court: { type: Number, min: 1, max: 6, default: null },

    // scheduled  -> created, waiting for a free court
    // assigned   -> placed on a court, waiting for scorer to configure positions/server
    // live       -> in progress
    // paused     -> temporarily halted by the court scorer
    // finished   -> completed, winner set
    status: {
      type: String,
      enum: ['scheduled', 'assigned', 'live', 'paused', 'finished'],
      default: 'scheduled',
    },

    positions: { type: positionsSchema, default: () => ({}) },
    firstServer: { type: String, default: null },

    score: {
      teamA: { type: Number, default: 0 },
      teamB: { type: Number, default: 0 },
    },
    history: { type: [historyEntrySchema], default: [] },

    winner: { type: String, enum: ['teamA', 'teamB', null], default: null },

    startedAt: { type: Date, default: null },
    finishedAt: { type: Date, default: null },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Match', matchSchema);

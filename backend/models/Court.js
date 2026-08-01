const mongoose = require('mongoose');

const courtSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true, unique: true, min: 1, max: 6 },
    currentMatch: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', default: null },
    nextMatch: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', default: null },
    // idle -> no current match assigned
    // occupied -> a match is assigned/live/paused on this court
    status: { type: String, enum: ['idle', 'occupied'], default: 'idle' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Court', courtSchema);

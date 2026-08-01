// One-time setup script: creates the 6 fixed courts and a bootstrap
// central_scorer account so you have a way to log in and create further
// accounts. Run with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Court = require('../models/Court');
const User = require('../models/User');

const run = async () => {
  await connectDB();

  // Create courts 1-6 if they don't already exist
  for (let number = 1; number <= 6; number += 1) {
    const exists = await Court.findOne({ number });
    if (!exists) {
      await Court.create({ number });
      console.log(`Created court ${number}`);
    }
  }

  // Create bootstrap admin (central scorer)
  const email = (process.env.ADMIN_EMAIL || 'admin@tournament.com').toLowerCase();
  const existingAdmin = await User.findOne({ email });
  if (!existingAdmin) {
    await User.create({
      name: process.env.ADMIN_NAME || 'Central Admin',
      email,
      password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
      role: 'central_scorer',
    });
    console.log(`Created central scorer admin account: ${email}`);
  } else {
    console.log(`Admin account already exists: ${email}`);
  }

  console.log('Seed complete.');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

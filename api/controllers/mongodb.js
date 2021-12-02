const db = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/auth';

const mongoose = async () => {
  try {
    const conn = await db.connect(MONGO_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
  } catch (error) {
    console.error(`Error: ${error} `);
    process.exit(1);
  }
};

module.exports = mongoose;

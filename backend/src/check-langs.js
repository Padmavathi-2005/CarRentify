const mongoose = require('mongoose');

async function checkLangs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/CarRentify');
    const langs = await mongoose.connection.db.collection('languages').find({}).toArray();
    console.log('LANGUAGES_IN_DB:', JSON.stringify(langs.map(l => ({ code: l.code, name: l.name })), null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkLangs();

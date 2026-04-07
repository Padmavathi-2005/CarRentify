const mongoose = require('mongoose');

async function checkDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/CarRentify');
    console.log('Connected to DB');
    
    // We can't easily access the Models here without defining them, 
    // but we can check collection names.
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    const brandsCount = await mongoose.connection.db.collection('brands').countDocuments();
    const carsCount = await mongoose.connection.db.collection('cars').countDocuments();
    
    console.log('Brands Count:', brandsCount);
    console.log('Cars Count:', carsCount);
    
    process.exit(0);
  } catch (err) {
    console.error('DB Error:', err.message);
    process.exit(1);
  }
}

checkDB();

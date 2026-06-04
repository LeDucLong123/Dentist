const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/dentist';

async function test() {
  try {
    console.log("Connecting to", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully!");
    
    const UserSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.models.User || mongoose.model('User', UserSchema, 'users');
    
    const count = await User.countDocuments();
    console.log(`Total users in DB: ${count}`);
    
    const users = await User.find({}, { password: 0 });
    console.log("Users:", users);
    
    await mongoose.connection.close();
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
}

test();

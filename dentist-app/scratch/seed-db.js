const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://localhost:27017/dentist';

// Define minimalist user schema for seeding
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'patient' }
});

// Hash password on save
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.models.User || mongoose.model('User', UserSchema, 'users');

async function seed() {
  try {
    console.log("Connecting to", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully!");

    const count = await User.countDocuments();
    if (count === 0) {
      console.log("No users found. Seeding a default admin...");
      
      const adminUser = new User({
        name: "Admin System",
        email: "admin@clinicserenity.vn",
        password: "admin123",
        role: "admin"
      });
      
      await adminUser.save();
      console.log("Seeded successfully!");
      console.log("Default credentials:");
      console.log("Email: admin@clinicserenity.vn");
      console.log("Password: admin123");
    } else {
      console.log(`Database already has ${count} users. Skipping seeding.`);
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exit(1);
  }
}

seed();

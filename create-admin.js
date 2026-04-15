const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  department: { type: String },
  designation: { type: String },
  profileImageUrl: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'blocked'], default: 'pending' },
  passwordResetToken: { type: String },
  passwordResetExpiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/policy-webapp');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'marketing@onepws.com' });
    if (existingAdmin) {
      console.log('Admin already exists with email: marketing@onepws.com');
      await mongoose.disconnect();
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('Rohit@11', 10);

    // Create admin user
    const admin = await User.create({
      name: 'Admin',
      email: 'marketing@onepws.com',
      password: hashedPassword,
      role: 'admin',
      status: 'approved',
    });

    console.log('✅ Admin account created successfully!');
    console.log('Email: marketing@onepws.com');
    console.log('Password: Rohit@11');
    console.log('Role: Admin');
    console.log('Status: Approved');
    console.log('\nGo to http://localhost:3000/login to login');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
}

createAdmin();

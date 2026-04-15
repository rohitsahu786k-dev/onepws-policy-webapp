const mongoose = require('mongoose');

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

async function fixAdminRole() {
  try {
    await mongoose.connect('mongodb://localhost:27017/policy-webapp');
    console.log('Connected to MongoDB');

    // Update admin role
    const result = await User.findOneAndUpdate(
      { email: 'marketing@onepws.com' },
      { role: 'admin' },
      { new: true }
    );

    if (result) {
      console.log('✅ Admin role updated successfully!');
      console.log('Name:', result.name);
      console.log('Email:', result.email);
      console.log('Role:', result.role);
      console.log('Status:', result.status);
    } else {
      console.log('❌ User not found');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixAdminRole();

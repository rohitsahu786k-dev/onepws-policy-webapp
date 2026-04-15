import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  department?: string;
  designation?: string;
  profileImageUrl?: string;
  passwordResetToken?: string;
  passwordResetExpiresAt?: Date;
  activationToken?: string;
  activationTokenExpiresAt?: Date;
  role: 'user' | 'admin';
  status: 'pending' | 'approved' | 'rejected' | 'blocked';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    department: { type: String, default: '' },
    designation: { type: String, default: '' },
    profileImageUrl: { type: String, default: '' },
    passwordResetToken: { type: String, default: '' },
    passwordResetExpiresAt: { type: Date, default: null },
    activationToken: { type: String, default: '' },
    activationTokenExpiresAt: { type: Date, default: null },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'blocked'], default: 'pending' },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

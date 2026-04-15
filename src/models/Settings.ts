import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  approverEmails: string[];
  updatedAt: Date;
}

const SettingsSchema: Schema = new Schema(
  {
    approverEmails: { type: [String], default: ['marketing@onepws.com'] },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

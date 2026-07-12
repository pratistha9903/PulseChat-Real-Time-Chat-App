import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, required: true, lowercase: true, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, required: true, trim: true },
    avatarColor: { type: String, required: true },
    lastSeen: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);

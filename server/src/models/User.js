import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, default: '' },
    role: { type: String, enum: ['Admin', 'Student'], default: 'Student' },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: function() { return this.role === 'Student'; } },
    department: { type: String, default: '' },
    year: { type: Number, default: 1 },
    rollNumber: { type: String, default: '' },
    profileImage: { type: String, default: '' }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);

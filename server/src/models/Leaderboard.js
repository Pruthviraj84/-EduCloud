import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema(
  {
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    averageScore: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 }, // Percentage
    testsCompleted: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    scoreFormulaValue: { type: Number, default: 0 }
  },
  { timestamps: true }
);

leaderboardSchema.index({ collegeId: 1, studentId: 1 }, { unique: true });

export const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    questionText: { type: String, required: true, trim: true },
    options: [
      {
        key: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
        text: { type: String, required: true }
      }
    ],
    correctAnswer: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
    explanation: { type: String, default: '' },
    marks: { type: Number, default: 1 },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    source: { type: String, enum: ['AI', 'Manual'], default: 'Manual' }
  },
  { timestamps: true }
);

export const Question = mongoose.model('Question', questionSchema);

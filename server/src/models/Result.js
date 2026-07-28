import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  selectedOption: { type: String, enum: ['A', 'B', 'C', 'D', ''], default: '' },
  isCorrect: { type: Boolean, default: false },
  marksObtained: { type: Number, default: 0 }
});

const resultSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    answers: [answerSchema],
    totalScore: { type: Number, required: true, default: 0 },
    percentage: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['Passed', 'Failed'], default: 'Failed' },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Result = mongoose.model('Result', resultSchema);

import mongoose from 'mongoose';

const testSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    studyMaterialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material' },
    subject: { type: String, default: 'General' },
    department: { type: String, default: 'General' },
    duration: { type: Number, required: true, default: 30 }, // in minutes
    passingMarks: { type: Number, required: true, default: 40 },
    totalMarks: { type: Number, default: 100 },
    attemptsAllowed: { type: Number, default: 1 },
    shuffleQuestions: { type: Boolean, default: true },
    shuffleOptions: { type: Boolean, default: true },
    schedule: {
      startDate: { type: Date, default: Date.now },
      endDate: { type: Date, required: true }
    },
    isResultPublished: { type: Boolean, default: true },
    isReviewAllowed: { type: Boolean, default: true },
    negativeMarking: { type: Number, default: 0 },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export const Test = mongoose.model('Test', testSchema);

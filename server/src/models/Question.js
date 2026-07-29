import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', index: true },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    studyMaterialId: { type: mongoose.Schema.Types.ObjectId, ref: 'Material', index: true },
    subject: { type: String, default: 'General' },
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
    source: { type: String, enum: ['AI', 'Manual'], default: 'AI' }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true }
  }
);

questionSchema.virtual('question').get(function () {
  return this.questionText;
}).set(function (val) {
  this.questionText = val;
});

export const Question = mongoose.model('Question', questionSchema);

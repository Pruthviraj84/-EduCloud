import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    department: { type: String, required: true },
    semester: { type: Number, required: true },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true }
  },
  { timestamps: true }
);

export const Subject = mongoose.model('Subject', subjectSchema);

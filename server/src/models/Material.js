import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'image'], default: 'pdf' },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    department: { type: String, default: 'General' },
    semester: { type: Number, default: 1 },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export const Material = mongoose.model('Material', materialSchema);

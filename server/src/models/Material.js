import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    subject: { type: String, default: 'General', trim: true },
    department: { type: String, default: 'General', trim: true },
    semester: { type: Number, default: 1 },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cloudinaryPublicId: { type: String, required: true },
    cloudinaryUrl: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'docx', 'doc', 'ppt', 'pptx', 'image'], default: 'pdf' },
    fileSize: { type: Number, default: 0 } // in bytes
  },
  { timestamps: true }
);

export const Material = mongoose.model('Material', materialSchema);
export const StudyMaterial = Material;

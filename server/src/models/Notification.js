import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'warning', 'success', 'error'], default: 'info' },
    targetRole: { type: String, enum: ['All', 'Admin', 'Student'], default: 'All' },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', notificationSchema);

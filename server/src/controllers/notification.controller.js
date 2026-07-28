import { Notification } from '../models/Notification.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getNotifications = async (req, res, next) => {
  try {
    const filter = {
      $or: [
        { targetRole: 'All' },
        { targetRole: req.user.role },
        { userId: req.user._id }
      ]
    };

    if (req.user.role === 'Student') {
      filter.collegeId = req.user.collegeId;
    } else if (req.tenantCollegeId) {
      filter.collegeId = req.tenantCollegeId;
    }

    const notifications = await Notification.find(filter).sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, notifications, 'Notifications fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    res.status(200).json(new ApiResponse(200, notification, 'Notification marked as read'));
  } catch (error) {
    next(error);
  }
};

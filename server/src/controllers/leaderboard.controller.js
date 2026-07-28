import { Leaderboard } from '../models/Leaderboard.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { updateCollegeLeaderboard } from '../services/leaderboard.service.js';

export const getLeaderboard = async (req, res, next) => {
  try {
    const targetCollegeId = req.user.role === 'Student' ? req.user.collegeId : (req.tenantCollegeId || req.query.collegeId || req.user.collegeId);

    if (!targetCollegeId) {
      throw new ApiError(400, 'College ID is required to fetch tenant leaderboard');
    }

    const leaderboard = await Leaderboard.find({ collegeId: targetCollegeId })
      .populate('studentId', 'name email rollNumber department profileImage')
      .sort({ rank: 1 });

    res.status(200).json(new ApiResponse(200, leaderboard, 'Leaderboard fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const recalculateLeaderboard = async (req, res, next) => {
  try {
    const targetCollegeId = req.tenantCollegeId || req.body.collegeId || req.user.collegeId;

    if (!targetCollegeId) {
      throw new ApiError(400, 'College ID required for recalculation');
    }

    await updateCollegeLeaderboard(targetCollegeId);

    const leaderboard = await Leaderboard.find({ collegeId: targetCollegeId })
      .populate('studentId', 'name email rollNumber department')
      .sort({ rank: 1 });

    res.status(200).json(new ApiResponse(200, leaderboard, 'Leaderboard recalculated and updated'));
  } catch (error) {
    next(error);
  }
};

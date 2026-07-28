import { Result } from '../models/Result.js';
import { Test } from '../models/Test.js';
import { User } from '../models/User.js';
import { Material } from '../models/Material.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getCollegeAnalyticsReport = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'Student') {
      filter.collegeId = req.user.collegeId;
    } else if (req.tenantCollegeId) {
      filter.collegeId = req.tenantCollegeId;
    }

    const totalStudents = await User.countDocuments({ ...filter, role: 'Student' });
    const totalTests = await Test.countDocuments(filter);
    const totalMaterials = await Material.countDocuments(filter);
    const totalResults = await Result.find(filter);

    const passedCount = totalResults.filter(r => r.status === 'Passed').length;
    const failedCount = totalResults.length - passedCount;
    const avgScore = totalResults.length > 0 ? totalResults.reduce((a, b) => a + b.percentage, 0) / totalResults.length : 0;

    res.status(200).json(
      new ApiResponse(200, {
        totalStudents,
        totalTests,
        totalMaterials,
        totalSubmissions: totalResults.length,
        passedCount,
        failedCount,
        avgScore: Math.round(avgScore * 100) / 100
      }, 'College analytics report retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

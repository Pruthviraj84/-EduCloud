import { ApiError } from '../utils/apiError.js';

export const verifyCollegeAccess = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'User authentication required for tenant verification'));
  }

  // Admin has cross-college super access if explicitly operating, otherwise scoped by collegeId param or header
  if (req.user.role === 'Admin') {
    const targetCollegeId = req.params.collegeId || req.query.collegeId || req.body.collegeId;
    if (targetCollegeId) {
      req.tenantCollegeId = targetCollegeId;
    } else {
      req.tenantCollegeId = req.user.collegeId ? req.user.collegeId.toString() : null;
    }
    return next();
  }

  // Student MUST have a valid assigned collegeId
  if (!req.user.collegeId) {
    return next(new ApiError(403, 'Tenant Access Denied: User is not assigned to any College Tenant'));
  }

  const userCollegeIdStr = req.user.collegeId.toString();

  // If a collegeId is passed in request, strictly enforce equality
  const requestedCollegeId = req.params.collegeId || req.query.collegeId || req.body.collegeId;
  if (requestedCollegeId && requestedCollegeId !== userCollegeIdStr) {
    return next(new ApiError(403, 'Tenant Isolation Violation: Cross-college data access forbidden'));
  }

  // Set normalized tenant collegeId for downstream controller queries
  req.tenantCollegeId = userCollegeIdStr;
  next();
};

export const checkCollegeAccess = verifyCollegeAccess;

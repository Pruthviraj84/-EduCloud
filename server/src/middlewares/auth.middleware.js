import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';

export const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, 'Unauthorized request: Missing token');
    }

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || 'super_secret_jwt_key_2026_change_this_in_production'
    );

    const user = await User.findById(decodedToken?.id);

    if (!user) {
      throw new ApiError(401, 'Invalid Access Token: User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(401, error?.message || 'Invalid authentication token'));
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Role (${req.user.role}) is not authorized to access this resource`
        )
      );
    }
    next();
  };
};

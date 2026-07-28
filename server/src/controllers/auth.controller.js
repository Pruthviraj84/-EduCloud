import { User } from '../models/User.js';
import { College } from '../models/College.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { generateToken } from '../utils/generateToken.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, collegeCode, collegeId, department, year, rollNumber, phone } = req.body;

    if (!name || !email || !password) {
      throw new ApiError(400, 'Name, email, and password are required');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, 'User with this email already exists');
    }

    let assignedCollegeId = collegeId;

    if (role === 'Student') {
      if (!assignedCollegeId && collegeCode) {
        const college = await College.findOne({ code: collegeCode.toUpperCase() });
        if (!college) {
          throw new ApiError(404, 'Invalid College Code provided');
        }
        assignedCollegeId = college._id;
      }
      if (!assignedCollegeId) {
        throw new ApiError(400, 'Students must specify a valid College Code or College ID');
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Student',
      collegeId: assignedCollegeId || null,
      department: department || '',
      year: year || 1,
      rollNumber: rollNumber || '',
      phone: phone || ''
    });

    const token = generateToken(res, user);
    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json(new ApiResponse(201, { user: userObj, token }, 'Registration successful'));
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const user = await User.findOne({ email }).select('+password').populate('collegeId', 'name code');
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const token = generateToken(res, user);
    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json(new ApiResponse(200, { user: userObj, token }, 'Login successful'));
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('collegeId', 'name code address');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    res.status(200).json(new ApiResponse(200, user, 'Profile fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
  } catch (error) {
    next(error);
  }
};

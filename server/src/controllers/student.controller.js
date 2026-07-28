import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getStudents = async (req, res, next) => {
  try {
    const filter = { role: 'Student' };
    
    // Strict Tenant Isolation Check
    if (req.user.role === 'Student') {
      filter.collegeId = req.user.collegeId;
    } else if (req.tenantCollegeId) {
      filter.collegeId = req.tenantCollegeId;
    }

    const students = await User.find(filter)
      .populate('collegeId', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, students, 'Students retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req, res, next) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'Student' })
      .populate('collegeId', 'name code');

    if (!student) {
      throw new ApiError(404, 'Student not found');
    }

    // Enforce Tenant Access Limit for non-super users
    if (req.user.role === 'Student' && student.collegeId._id.toString() !== req.user.collegeId.toString()) {
      throw new ApiError(403, 'Tenant Access Denied: Cannot view students from other colleges');
    }

    res.status(200).json(new ApiResponse(200, student, 'Student details fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateStudentProfile = async (req, res, next) => {
  try {
    const { name, phone, department, year, rollNumber } = req.body;
    
    const student = await User.findById(req.user._id);
    if (!student) {
      throw new ApiError(404, 'User not found');
    }

    if (name) student.name = name;
    if (phone) student.phone = phone;
    if (department) student.department = department;
    if (year) student.year = year;
    if (rollNumber) student.rollNumber = rollNumber;

    await student.save();

    res.status(200).json(new ApiResponse(200, student, 'Profile updated successfully'));
  } catch (error) {
    next(error);
  }
};

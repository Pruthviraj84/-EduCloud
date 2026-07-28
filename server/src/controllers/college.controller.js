import { College } from '../models/College.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const createCollege = async (req, res, next) => {
  try {
    const { name, code, address, contactEmail } = req.body;

    if (!name || !code) {
      throw new ApiError(400, 'College name and code are required');
    }

    const existingCode = await College.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      throw new ApiError(400, 'College code already exists');
    }

    const college = await College.create({
      name,
      code: code.toUpperCase(),
      address: address || '',
      contactEmail: contactEmail || ''
    });

    res.status(201).json(new ApiResponse(201, college, 'College created successfully'));
  } catch (error) {
    next(error);
  }
};

export const getAllColleges = async (req, res, next) => {
  try {
    const colleges = await College.find().sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, colleges, 'Colleges fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const getCollegeById = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      throw new ApiError(404, 'College not found');
    }
    res.status(200).json(new ApiResponse(200, college, 'College details fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateCollege = async (req, res, next) => {
  try {
    const college = await College.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!college) {
      throw new ApiError(404, 'College not found');
    }
    res.status(200).json(new ApiResponse(200, college, 'College updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const toggleCollegeStatus = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      throw new ApiError(404, 'College not found');
    }

    college.isActive = !college.isActive;
    await college.save();

    res.status(200).json(new ApiResponse(200, college, `College status changed to ${college.isActive ? 'Active' : 'Inactive'}`));
  } catch (error) {
    next(error);
  }
};

import { Material } from '../models/Material.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import cloudinary from '../config/cloudinary.js';

export const uploadMaterial = async (req, res, next) => {
  try {
    const { title, description, subjectId, department, semester, collegeId } = req.body;

    if (!title) {
      throw new ApiError(400, 'Material title is required');
    }

    const assignedCollegeId = req.user.role === 'Admin' ? (collegeId || req.user.collegeId) : req.user.collegeId;

    if (!assignedCollegeId) {
      throw new ApiError(400, 'College ID is required to associate learning material');
    }

    let fileUrl = '';
    let fileType = 'pdf';

    if (req.file) {
      if (req.file.mimetype.includes('image')) {
        fileType = 'image';
      }

      // If Cloudinary configured, upload to Cloudinary; otherwise store local server path
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          resource_type: 'auto',
          folder: 'college_lms_materials'
        });
        fileUrl = uploadResult.secure_url;
      } else {
        fileUrl = `/uploads/${req.file.filename}`;
      }
    } else if (req.body.fileUrl) {
      fileUrl = req.body.fileUrl;
    } else {
      throw new ApiError(400, 'File upload or file URL is required');
    }

    const material = await Material.create({
      title,
      description: description || '',
      fileUrl,
      fileType,
      subjectId: subjectId || null,
      department: department || 'General',
      semester: semester ? parseInt(semester) : 1,
      collegeId: assignedCollegeId,
      uploadedBy: req.user._id
    });

    res.status(201).json(new ApiResponse(201, material, 'Material uploaded successfully'));
  } catch (error) {
    next(error);
  }
};

export const getMaterials = async (req, res, next) => {
  try {
    const filter = {};

    // Strict Tenant Isolation
    if (req.user.role === 'Student') {
      filter.collegeId = req.user.collegeId;
    } else if (req.tenantCollegeId) {
      filter.collegeId = req.tenantCollegeId;
    }

    if (req.query.department) filter.department = req.query.department;
    if (req.query.semester) filter.semester = req.query.semester;

    const materials = await Material.find(filter)
      .populate('uploadedBy', 'name email')
      .populate('subjectId', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, materials, 'Materials retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getMaterialById = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('uploadedBy', 'name email')
      .populate('collegeId', 'name code');

    if (!material) {
      throw new ApiError(404, 'Material asset not found');
    }

    // Enforce Tenant Access Limit
    if (req.user.role === 'Student' && material.collegeId._id.toString() !== req.user.collegeId.toString()) {
      throw new ApiError(403, 'Tenant Isolation Violation: Access denied to materials of other colleges');
    }

    res.status(200).json(new ApiResponse(200, material, 'Material details retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      throw new ApiError(404, 'Material not found');
    }

    await material.deleteOne();
    res.status(200).json(new ApiResponse(200, null, 'Material deleted successfully'));
  } catch (error) {
    next(error);
  }
};

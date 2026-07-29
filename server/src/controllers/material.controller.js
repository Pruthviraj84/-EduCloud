import { Material } from '../models/Material.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service.js';

export const uploadMaterial = async (req, res, next) => {
  try {
    const { title, description, subject, department, semester, collegeId } = req.body;

    if (!req.file) {
      throw new ApiError(400, 'Please attach a study material file (PDF, DOCX, PPT, or Image)');
    }

    if (!title) {
      throw new ApiError(400, 'Material title is required');
    }

    const assignedCollegeId = req.user.role === 'Admin' ? (collegeId || req.user.collegeId) : req.user.collegeId;

    if (!assignedCollegeId) {
      throw new ApiError(400, 'College ID is required to upload study material');
    }

    // Determine file type from extension
    const ext = req.file.originalname.split('.').pop().toLowerCase();
    let fileType = 'pdf';
    if (['docx', 'doc'].includes(ext)) fileType = 'docx';
    else if (['ppt', 'pptx'].includes(ext)) fileType = 'ppt';
    else if (['png', 'jpg', 'jpeg', 'webp', 'bmp'].includes(ext)) fileType = 'image';

    // 1. Upload to Cloudinary
    const cloudinaryData = await uploadToCloudinary(req.file.path, 'educloud_materials');

    // 2. Save metadata in MongoDB
    const material = await Material.create({
      title,
      description: description || '',
      subject: subject || 'General',
      department: department || 'General',
      semester: semester ? parseInt(semester) : 1,
      collegeId: assignedCollegeId,
      uploadedBy: req.user._id,
      cloudinaryPublicId: cloudinaryData.publicId,
      cloudinaryUrl: cloudinaryData.secureUrl,
      fileType,
      fileSize: cloudinaryData.bytes || req.file.size || 0
    });

    const populated = await Material.findById(material._id)
      .populate('uploadedBy', 'name email')
      .populate('collegeId', 'name code');

    res.status(201).json(new ApiResponse(201, populated, 'Study material uploaded successfully to Cloudinary'));
  } catch (error) {
    next(error);
  }
};

export const getMaterials = async (req, res, next) => {
  try {
    const filter = {};

    // Strict Tenant Scoping
    if (req.user.role === 'Student') {
      filter.collegeId = req.user.collegeId;
    } else if (req.tenantCollegeId) {
      filter.collegeId = req.tenantCollegeId;
    }

    if (req.query.subject) filter.subject = new RegExp(req.query.subject, 'i');
    if (req.query.department) filter.department = req.query.department;
    if (req.query.semester) filter.semester = parseInt(req.query.semester);
    if (req.query.fileType) filter.fileType = req.query.fileType;

    if (req.query.search) {
      filter.$or = [
        { title: new RegExp(req.query.search, 'i') },
        { description: new RegExp(req.query.search, 'i') },
        { subject: new RegExp(req.query.search, 'i') }
      ];
    }

    const materials = await Material.find(filter)
      .populate('uploadedBy', 'name email')
      .populate('collegeId', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, materials, 'Study materials retrieved successfully'));
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
      throw new ApiError(404, 'Study material not found');
    }

    // Tenant Isolation Check
    if (req.user.role === 'Student' && material.collegeId._id.toString() !== req.user.collegeId.toString()) {
      throw new ApiError(403, 'Tenant Isolation Error: Access denied to material from another college');
    }

    res.status(200).json(new ApiResponse(200, material, 'Material details fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      throw new ApiError(404, 'Study material not found');
    }

    // 1. Delete file from Cloudinary
    if (material.cloudinaryPublicId) {
      await deleteFromCloudinary(material.cloudinaryPublicId, material.fileType === 'image' ? 'image' : 'raw');
    }

    // 2. Delete document from MongoDB
    await material.deleteOne();

    res.status(200).json(new ApiResponse(200, null, 'Study material deleted from Cloudinary and database'));
  } catch (error) {
    next(error);
  }
};

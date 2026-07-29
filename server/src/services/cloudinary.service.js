import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

/**
 * Uploads a file to Cloudinary.
 * Handles PDFs, DOCX, PPTX, and Images.
 * Deletes local temp file after upload attempt.
 */
export const uploadToCloudinary = async (filePath, folder = 'educloud_materials') => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret || cloudName === 'demo_cloud' || cloudName.includes('your_')) {
      console.warn('[Cloudinary Service Warning] Cloudinary API credentials are missing or default in server environment variables.');
    }

    console.log(`[Cloudinary Service] Uploading file to Cloudinary folder '${folder}'...`);

    const fileExt = filePath.split('.').pop()?.toLowerCase() || 'raw';
    const resourceType = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'].includes(fileExt) ? 'image' : 'raw';

    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: resourceType
    });

    console.log(`[Cloudinary Upload Success] Public ID: ${result.public_id}, URL: ${result.secure_url}`);

    // Cleanup local temp file after upload
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkErr) {
        console.warn('[Cloudinary Service] Temp file cleanup notice:', unlinkErr.message);
      }
    }

    return {
      publicId: result.public_id,
      secureUrl: result.secure_url,
      resourceType: result.resource_type || resourceType,
      bytes: result.bytes || 0,
      format: result.format || fileExt
    };
  } catch (error) {
    // Ensure local temp file is cleaned up on error
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
    console.error('[Cloudinary Upload Error]', error.message);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Deletes a file from Cloudinary using publicId.
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'raw') => {
  try {
    if (!publicId) return true;
    console.log(`[Cloudinary Service] Destroying asset from Cloudinary: ${publicId}`);
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return true;
  } catch (error) {
    console.error('[Cloudinary Delete Error]', error.message);
    return false;
  }
};

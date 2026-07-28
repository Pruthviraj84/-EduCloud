import express from 'express';
import { uploadMaterial, getMaterials, getMaterialById, deleteMaterial } from '../controllers/material.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';
import { checkCollegeAccess } from '../middlewares/tenant.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.use(verifyJWT);
router.use(checkCollegeAccess);

router.post('/upload', authorizeRoles('Admin'), upload.single('file'), uploadMaterial);
router.get('/', getMaterials);
router.get('/:id', getMaterialById);
router.delete('/:id', authorizeRoles('Admin'), deleteMaterial);

export default router;

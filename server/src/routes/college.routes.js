import express from 'express';
import { createCollege, getAllColleges, getCollegeById, updateCollege, toggleCollegeStatus } from '../controllers/college.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyJWT);

router.post('/', authorizeRoles('Admin'), createCollege);
router.get('/', getAllColleges);
router.get('/:id', getCollegeById);
router.put('/:id', authorizeRoles('Admin'), updateCollege);
router.patch('/:id/toggle-status', authorizeRoles('Admin'), toggleCollegeStatus);

export default router;

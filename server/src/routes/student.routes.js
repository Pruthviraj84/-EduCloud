import express from 'express';
import { getStudents, getStudentById, updateStudentProfile } from '../controllers/student.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { checkCollegeAccess } from '../middlewares/tenant.middleware.js';

const router = express.Router();

router.use(verifyJWT);
router.use(checkCollegeAccess);

router.get('/', getStudents);
router.get('/:id', getStudentById);
router.put('/profile', updateStudentProfile);

export default router;

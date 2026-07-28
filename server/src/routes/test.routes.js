import express from 'express';
import { createTest, getTests, getTestById, updateTest, deleteTest, generateTestWithAI } from '../controllers/test.controller.js';
import { addQuestionToTest, getQuestionsByTest, updateQuestion, deleteQuestion } from '../controllers/question.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';
import { checkCollegeAccess } from '../middlewares/tenant.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.use(verifyJWT);
router.use(checkCollegeAccess);

// Test routes
router.post('/', authorizeRoles('Admin'), createTest);
router.get('/', getTests);
router.get('/:id', getTestById);
router.put('/:id', authorizeRoles('Admin'), updateTest);
router.delete('/:id', authorizeRoles('Admin'), deleteTest);

// AI Generation route
router.post('/generate-ai', authorizeRoles('Admin'), upload.single('file'), generateTestWithAI);

// Question routes
router.post('/questions', authorizeRoles('Admin'), addQuestionToTest);
router.get('/:testId/questions', getQuestionsByTest);
router.put('/questions/:id', authorizeRoles('Admin'), updateQuestion);
router.delete('/questions/:id', authorizeRoles('Admin'), deleteQuestion);

export default router;

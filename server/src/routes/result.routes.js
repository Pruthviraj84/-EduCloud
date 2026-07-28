import express from 'express';
import { submitTestResult, getStudentResults, getTestResultById, getTestAnalytics } from '../controllers/result.controller.js';
import { getCollegeAnalyticsReport } from '../controllers/report.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { checkCollegeAccess } from '../middlewares/tenant.middleware.js';

const router = express.Router();

router.use(verifyJWT);
router.use(checkCollegeAccess);

router.post('/submit', submitTestResult);
router.get('/', getStudentResults);
router.get('/reports/analytics', getCollegeAnalyticsReport);
router.get('/test-analytics/:testId', getTestAnalytics);
router.get('/:id', getTestResultById);

export default router;

import express from 'express';
import { getLeaderboard, recalculateLeaderboard } from '../controllers/leaderboard.controller.js';
import { verifyJWT, authorizeRoles } from '../middlewares/auth.middleware.js';
import { checkCollegeAccess } from '../middlewares/tenant.middleware.js';

const router = express.Router();

router.use(verifyJWT);
router.use(checkCollegeAccess);

router.get('/', getLeaderboard);
router.post('/recalculate', authorizeRoles('Admin'), recalculateLeaderboard);

export default router;

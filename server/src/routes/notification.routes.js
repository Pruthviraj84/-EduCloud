import express from 'express';
import { getNotifications, markAsRead } from '../controllers/notification.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { checkCollegeAccess } from '../middlewares/tenant.middleware.js';

const router = express.Router();

router.use(verifyJWT);
router.use(checkCollegeAccess);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);

export default router;

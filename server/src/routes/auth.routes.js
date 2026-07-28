import express from 'express';
import { register, login, getProfile, logout } from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', verifyJWT, getProfile);
router.post('/logout', verifyJWT, logout);

export default router;

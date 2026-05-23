import express from 'express';
import { getUserProfile, followUser, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile/:username', getUserProfile);
router.put('/:id/follow', protect, followUser);
router.put('/profile', protect, updateProfile);

export default router;

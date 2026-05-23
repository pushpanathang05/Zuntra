import express from 'express';
import {
  createPost,
  getAllPosts,
  getPostById,
  deletePost,
  likePost,
  savePost,
  addComment,
  getDistinctCategories,
  getPostsByCategory,
  getPostsByTag,
  getRelatedPosts,
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllPosts);
// Crucial: Mount categories list route BEFORE the :id parameter match to avoid conflict!
router.get('/categories', getDistinctCategories);
router.get('/category/:name', getPostsByCategory);
router.get('/tag/:tag', getPostsByTag);
router.get('/:id/related', getRelatedPosts);
router.get('/:id', getPostById);

// Protected routes
router.post('/', protect, upload.single('image'), createPost);
router.delete('/:id', protect, deletePost);
router.put('/:id/like', protect, likePost);
router.put('/:id/save', protect, savePost);
router.post('/:id/comments', protect, addComment);

export default router;

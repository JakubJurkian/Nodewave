import express, { Router } from 'express';

import {
  getCreatePost,
  getPost,
  getUserPosts,
  postCreatePost,
} from '../controllers/posts.js';
import isNotAuth from '../middleware/is-not-auth.js';
import { body } from 'express-validator';

const router: Router = express.Router();

router.get('/post/:postId', getPost);

router.get('/user/:username', getUserPosts);

router.get('/create-post', isNotAuth, getCreatePost);
router.post(
  '/create-post',
  isNotAuth,
  [body('content', 'Input should not be empty.').isLength({ min: 1 }).trim()],
  postCreatePost
);

export default router;

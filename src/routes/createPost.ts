import express, { Router } from 'express';
import { body } from 'express-validator';

import { getCreatePost, postCreatePost } from '../controllers/posts.js';
import isNotAuth from '../middleware/is-not-auth.js';

const router: Router = express.Router();

router.get('/create-post', isNotAuth, getCreatePost);
router.post(
  '/create-post',
  isNotAuth,
  [body('content').isLength({ min: 1 }).trim()],
  postCreatePost
);

export default router;

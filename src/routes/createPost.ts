import express, { Router } from 'express';

import { getCreatePost, postCreatePost } from '../controllers/createPost.js';
import isNotAuth from '../middleware/is-not-auth.js';

const router: Router = express.Router();

router.get('/create-post', isNotAuth, getCreatePost);
router.post('/create-post', isNotAuth, postCreatePost);

export default router;

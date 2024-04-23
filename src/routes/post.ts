import express, { Router } from 'express';

import { getPost } from '../controllers/posts.js';

const router: Router = express.Router();

router.get('/post/:postId', getPost);

export default router;

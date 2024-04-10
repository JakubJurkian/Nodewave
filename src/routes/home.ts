import express, { Router } from 'express';

import { getPost } from '../controllers/post.js';

const router: Router = express.Router();

router.get('/', getPost);

export default router;

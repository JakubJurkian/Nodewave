import express, { Router } from 'express';

import { getMyProfile, postMyProfile } from '../controllers/myProfile.js';
import isNotAuth from '../middleware/is-not-auth.js';
import { getPosts } from '../controllers/posts.js';

const router: Router = express.Router();

router.get('/', getPosts);

router.get('/my-profile', isNotAuth, getMyProfile);
router.post('/my-profile', isNotAuth, postMyProfile);

export default router;

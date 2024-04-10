import express, { Router } from 'express';

import { getMyProfile, postMyProfile } from '../controllers/myProfile.js';
import isAuth from '../middleware/is-auth.js';

const router: Router = express.Router();

router.get('/my-profile', isAuth, getMyProfile);
router.post('/my-profile', isAuth, postMyProfile);

export default router;

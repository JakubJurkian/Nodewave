import express, { Router } from 'express';

import { getMyProfile } from '../controllers/myProfile.js';
import isAuth from '../middleware/is-auth.js';

const router: Router = express.Router();

router.get('/my-profile', isAuth, getMyProfile);

export default router;

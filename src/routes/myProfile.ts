import express from 'express';

import { getMyProfile } from '../controllers/myProfile.js';

const router = express.Router();

router.get('/my-profile', getMyProfile);

export default router;

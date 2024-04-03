import express from 'express';
import exValidator from 'express-validator';

import {
  getLogin,
  getSignup,
  postLogin,
  postSignup,
} from '../controllers/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/signup', getSignup);
router.get('/login', getLogin);

router.post('/signup', [
  exValidator
    .body('email')
    .isEmail()
    .withMessage('Please enter a valid email.')
    .normalizeEmail(),
  exValidator.body('username').isLength({ min: 3 }),
  exValidator
    .body('password', 'Password has to be valid.')
    .isLength({ min: 4 })
    .isAlphanumeric()
    .custom(async (value, { }) => {
      const userDoc = await User.findOne({ email: value });
      if (userDoc) {
        return Promise.reject('E-mail exists already.');
      }
      //this is async cause we have to reach out to the db (using promises)
    })
    .trim(),
  exValidator
    .body('confirmPassword')
    .trim()
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error('Passwords have to match!');
      }
      return true;
    }),
], postSignup);
router.post('/login', postLogin);

export default router;

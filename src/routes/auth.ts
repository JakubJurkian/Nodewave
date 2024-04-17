import express, { Router } from 'express';
import exValidator from 'express-validator';

import {
  getLogin,
  getResetPassword,
  getResetPasswordRequest,
  getSignup,
  postLogin,
  postLogout,
  postResetPassword,
  postResetPasswordRequest,
  postSignup,
} from '../controllers/auth.js';
import User from '../models/User.js';
import isAuth from '../middleware/is-auth.js';
import isNotAuth from '../middleware/is-not-auth.js';

const router: Router = express.Router();

router.get('/signup', isAuth, getSignup);
router.get('/login', isAuth, getLogin);

router.post(
  '/signup',
  [
    exValidator
      .body('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .normalizeEmail()
      .custom(async (value, {}) => {
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
          return Promise.reject('E-mail exists already.');
        }
        //this is async cause we have to reach out to the db (using promises)
      }),
    exValidator.body('username').isLength({ min: 3 }),
    exValidator
      .body('password', 'Password has to be valid.')
      .isLength({ min: 4 })
      .isAlphanumeric()
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
  ],
  postSignup
);

router.post('/login', postLogin);
router.post('/logout', postLogout);
router.get('/reset-password-request', isAuth, getResetPasswordRequest);
router.post('/reset-password-request', postResetPasswordRequest);
router.get('/reset-password', isNotAuth, getResetPassword);
router.get('/reset-password/:token', getResetPassword);

router.post(
  '/reset-password',
  [
    exValidator
      .body('password', 'Password has to be valid.')
      .isLength({ min: 4 })
      .isAlphanumeric()
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
  ],
  postResetPassword
);

export default router;

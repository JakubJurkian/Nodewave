import express, { Router } from 'express';
import { body } from 'express-validator';

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
router.get('/reset-password-request', isAuth, getResetPasswordRequest);
router.get('/reset-password', isNotAuth, getResetPassword);
router.get('/reset-password/:token', getResetPassword);

router.post('/login', postLogin);
router.post('/logout', postLogout);
router.post('/reset-password-request', postResetPasswordRequest);
router.post(
  '/signup',
  [
    body('email')
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
    body('username').isLength({ min: 3 }),

    body('password', 'Password has to be valid.')
      .isLength({ min: 4 })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword')
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

router.post(
  '/reset-password',
  [
    body('password', 'Password has to be valid.')
      .isLength({ min: 4 })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword')
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

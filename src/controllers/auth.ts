import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { validationResult } from 'express-validator';

import User from '../models/User.js';
import { AuthenticatedRequest } from '../app.js';

export const getSignup = (_: Request, res: Response): void => {
  res.render('auth/signup', {
    pageTitle: 'Signup',
    error: null,
    username: null,
    email: null,
  });
};

export const getLogin = (_: Request, res: Response): void => {
  res.render('auth/login', {
    pageTitle: 'Login',
    error: null,
    email: null,
  });
};

export const postSignup = async (
  req: Request,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  let error = null;
  if (!errors.isEmpty()) {
    error = { msg: errors.array()[0].msg };
  }
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', {
      pageTitle: 'Signup',
      error,
      username: req.body.username,
      email: req.body.email,
    });
  }

  const email = req.body.email;
  const doesEmailExist = await User.findOne({ email });
  if (doesEmailExist) {
    console.log('email already exists!');
    return res.status(422).render('auth/signup', {
      pageTitle: 'Signup',
      error,
      username: req.body.username,
      email,
    });
  }

  const username = req.body.username;

  const doesUsernameExist = await User.findOne({ username });
  if (doesUsernameExist) {
    console.log('username already exists.');
    return res.status(422).render('auth/signup', {
      pageTitle: 'Signup',
      error,
      username,
      email,
    });
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 12);
  const avatar = 'src/images/default-avatar.jpg';

  const user = new User({ email, username, password: hashedPassword, avatar });
  user.save();
  res.render('auth/login', { pageTitle: 'Login', error: null });
};

export const postLogin = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = { msg: errors.array()[0].msg };
    console.log('incorrect data!');
    return res.status(422).render('auth/login', {
      pageTitle: 'Login',
      error,
      email: req.body.email,
    });
  }

  const email = req.body.email;
  const hashedPassword = req.body.password;

  const error = { msg: 'Incorrect email or password!' };
  const user = await User.findOne({ email });
  if (!user) {
    console.log('incorrect email!');
    return res.status(422).render('auth/login', {
      pageTitle: 'Login',
      error,
      email: req.body.email,
    });
  }

  const doMatch = await bcrypt.compare(hashedPassword, user.password);
  if (doMatch) {
    req.session.isLoggedIn = true;
    req.session.user = user;
    return res.redirect('/');
  } else {
    console.log('incorrect password!');
    return res.status(422).render('auth/login', {
      pageTitle: 'Login',
      error,
      email: req.body.email,
    });
  }
};

export const postLogout = (req: Request, res: Response): void => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};

export const getResetPassword = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (req.user) {
    return res.render('auth/resetPassword', {
      pageTitle: 'Reset Password',
      userId: req.user._id.toString(),
      isUserAuth: true,
    });
  } else {
    const token = req.params.token;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: {
        $gt: Date.now(), //$gt - greater than
      },
    });

    if (user) {
      res.render('auth/resetPassword', {
        pageTitle: 'Reset Password',
        passwordToken: token,
        userId: user._id.toString(),
        isUserAuth: false,
      });
    }
  }
};

export const postResetPassword = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log('Validation error:', errors.array());
      return res.status(422).render('auth/resetPassword', {
        pageTitle: 'Reset Password',
        userId: req.user?._id.toString(),
        isUserAuth: !!req.user,
        passwordToken: req.body.passwordToken,
      });
    }

    if (req.user) {
      const newPassword = req.body.password;
      let resetUser;
      resetUser = req.user;
      const hashedPw = await bcrypt.hash(newPassword, 12);
      resetUser.password = hashedPw;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      await resetUser.save();
      console.log('password changed');

      return res.redirect('/');
    } else {
      const newPassword = req.body.password;
      let resetUser;

      const user = await User.findOne({
        resetToken: req.body.passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
        _id: req.body.userId,
      });

      if (!user) {
        console.log('User not found or token expired.');
        return res.status(422).render('auth/login', {
          pageTitle: 'Login',
        });
      }

      resetUser = user;
      const hashedPw = await bcrypt.hash(newPassword, 12);
      resetUser.password = hashedPw;

      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      await resetUser.save();
      console.log('password changed');

      return res.redirect('/login');
    }
  } catch (error) {
    console.error('Error occured:', error);
    return res.status(500).redirect('/');
  }
};

export const getResetPasswordRequest = (_: Request, res: Response): void => {
  res.render('auth/resetPasswordRequest', { pageTitle: 'Reset Password' });
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: 'kuba.jur03@gmail.com', pass: 'neircgxujuptizak' },
  tls: { rejectUnauthorized: false },
});

export const postResetPasswordRequest = async (
  req: Request,
  res: Response
): Promise<void> => {
  //creating a token for the user
  crypto.randomBytes(32, async (err, buffer) => {
    if (err) return res.redirect('/reset-password-request');

    const token = buffer.toString('hex');
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      console.log('this email does not exist');
    } else {
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      await user.save();
      console.log('check your email');
      transporter
        .sendMail({
          to: req.body.email,
          from: 'kuba.jur03@gmail.com',
          subject: 'Password reset',
          html: `<p>You requested a password reset</p>
      <p>Click this <a href="http://localhost:3000/reset-password/${token}">link</a> to set a new password.</p>
    `,
        })
        .catch((err: any) => console.log(err));
    }
    res.redirect('/');
  });
};

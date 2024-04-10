import { Request, Response, NextFunction } from 'express';

import exValidatorRes from 'express-validator';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

export const getSignup = (req: Request, res: Response, next: NextFunction): void => {
  res.render('auth/signup', {
    pageTitle: 'Signup',
    isAuthenticated: req.session.isLoggedIn,
  });
};

export const getLogin = (req: Request, res: Response, next: NextFunction): void => {
  res.render('auth/login', {
    pageTitle: 'Login',
    isAuthenticated: req.session.isLoggedIn,
  });
};

export const postSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const errors = exValidatorRes.validationResult(req);
  if (!errors.isEmpty()) {
    console.log('incorrect data!');
    return res.status(422).render('auth/signup', { pageTitle: 'Login' });
  }
  console.log('Req body:', req.body);

  const email = req.body.email;
  const doesEmailExist = await User.findOne({ email: email });
  if (doesEmailExist) {
    console.log('email already exists!');
    return res.status(422).render('auth/signup', { pageTitle: 'Login' });
  }

  const username = req.body.username;
  const password = req.body.password;
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = new User({ email, username, password: hashedPassword });
  user.save();
  res.render('auth/login', { pageTitle: 'Login' });
};

export const postLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const errors = exValidatorRes.validationResult(req);
  if (!errors.isEmpty()) {
    console.log('incorrect data!');
    return res.status(422).render('auth/login', { pageTitle: 'Login' });
  }

  const email = req.body.email;
  const hashedPassword = req.body.password;

  const user = await User.findOne({ email });
  if (!user) {
    console.log('incorrect email or password!');
    return res.status(422).render('auth/login', { pageTitle: 'Login' });
  }

  const doMatch = await bcrypt.compare(hashedPassword, user.password);
  if (doMatch) {
    req.session.isLoggedIn = true;
    req.session.user = user;
    return res.redirect('/');
  } else {
    console.log('incorrect email or password!');
    return res.status(422).render('auth/login', { pageTitle: 'Login' });
  }
};

export const postLogout = (req: Request, res: Response, next: NextFunction): void => {
  req.session.destroy((err) => {
    res.redirect('/');
  });
};

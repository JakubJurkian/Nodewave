import { Request, Response, NextFunction } from 'express';

import exValidatorRes from 'express-validator';

export const getSignup = (req: Request, res: Response, next: NextFunction) => {
  res.render('auth/signup', { pageTitle: 'Signup' });
};

export const getLogin = (req: Request, res: Response, next: NextFunction) => {
  res.render('auth/login', { pageTitle: 'Signup' });
};

export const postLogin = (req: Request, res: Response, next: NextFunction) => {
  const errors = exValidatorRes.validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', { pageTitle: 'Login' });
  }
};

export const postSignup = (req: Request, res: Response, next: NextFunction) => {
  const errors = exValidatorRes.validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/signup', { pageTitle: 'Login' });
  }
  console.log("Req body:", req.body);
};

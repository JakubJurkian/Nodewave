import { Request, Response, NextFunction } from 'express';

export default (req: Request, res: Response, next: NextFunction): void => {
  if (!req.session.isLoggedIn) {
    res.redirect('/login');
    return;
  }
  next();
};

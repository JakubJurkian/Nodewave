import { Request, Response, NextFunction } from 'express';

export const getMyProfile = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.render('myProfile', { pageTitle: 'My Profile' });
};

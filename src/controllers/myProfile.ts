import { Request, Response, NextFunction } from 'express';

export const getMyProfile = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.session.user);
  const user = {
    email: req.session.user.email,
    username: req.session.user.username,
  };
  res.render('myProfile', {
    pageTitle: 'My Profile',
    isAuthenticated: req.session.isLoggedIn,
    user
  });
};

import { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';

export const getMyProfile = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const user = {
    email: req.session.user.email,
    username: req.session.user.username,
    avatar: req.session.user.avatar.replace(/\\/g, '/')
  };

  res.render('myProfile', {
    pageTitle: 'My Profile',
    isAuthenticated: req.session.isLoggedIn,
    user,
  });
};

export const postMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const image = req.file;
  if (!image) return res.redirect('/my-profile');

  const imageUrl = image.path;

  const user = await User.findById(req.session.user._id);
  if (user) {
    user.avatar = imageUrl;
    await user.save();
    console.log('done');
    req.session.user = user;
  }

  return res.status(200).redirect('/my-profile');
};

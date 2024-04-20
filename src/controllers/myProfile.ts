import { Request, Response, NextFunction } from 'express';

import User from '../models/User.js';
import deleteFile from '../util/file.js';
import { AuthenticatedRequest } from '../app.js';

export const getMyProfile = (
  req: Request,
  res: Response
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
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const image = req.file;
  if (!image) return res.redirect('/my-profile');

  deleteFile(req.session.user.avatar);

  const imageUrl = image.path;

  const user = await User.findById(req.session.user._id);
  if (user) {
    user.avatar = imageUrl;
    await user.save();
    console.log('image changed.');
    req.session.user = user;
  }

  return res.status(200).redirect('/my-profile');
};

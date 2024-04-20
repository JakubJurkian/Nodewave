import { Request, Response } from 'express';

import User from '../models/User.js';
import deleteFile from '../util/file.js';
import { AuthenticatedRequest } from '../app.js';
import Post from '../models/Post.js';
import formatDate from '../util/formatDate.js';

export const getMyProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const user = {
    email: req.session.user.email,
    username: req.session.user.username,
    avatar: req.session.user.avatar.replace(/\\/g, '/'),
  };

  const myPosts = await Post.find({ user: req.user.username });
  console.log(myPosts);
  myPosts.forEach((p) => {
    p.toObject();
    p.date = formatDate(p.date);
    return p;
  });

  res.render('myProfile', {
    pageTitle: 'My Profile',
    isAuthenticated: req.session.isLoggedIn,
    user,
    posts: myPosts,
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

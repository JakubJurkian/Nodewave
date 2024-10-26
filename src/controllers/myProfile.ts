import { Response } from 'express';

import User from '../models/User.js';
import Post from '../models/Post.js';
import deleteFile from '../util/file.js';
import formatDate from '../util/formatDate.js';
import { AuthenticatedRequest } from '../app.js';
import path from 'path';

export const getMyProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const myPosts = await Post.find({ user: req.user.username });
  myPosts.forEach((p) => {
    p.toObject();
    p.date = formatDate(p.date);
    return p;
  });

  const avatar = req.user.avatar.substring(req.user.avatar.indexOf('images'));

  console.log(avatar);

  const user = {
    email: req.user.email,
    username: req.user.username,
    avatar,
  };

  res.render('myProfile', {
    pageTitle: 'My Profile',
    user,
    posts: myPosts,
  });
};

export const postMyProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const image = req.file;
  // console.log(req.file);
  if (!image) return res.redirect('/my-profile');

  const avatar = 'src/public/' + req.user.avatar;
  deleteFile(avatar);
  const absoluteImageUrlPath = image.path;

  const relativeImgUrlPath = path.join('images', image.filename);

  const user = await User.findById(req.user._id);
  if (user) {
    user.avatar = relativeImgUrlPath;
    await user.save();
    console.log('image changed.');
    req.user = user;

    const posts = await Post.find({ user: user.username });
    if (posts) {
      posts.forEach(async (p) => {
        p.avatar = user.avatar;
        await p.save();
      });
    }
    return res.status(200).redirect('/my-profile');
  } else {
    return res.status(404).render('404');
  }
};

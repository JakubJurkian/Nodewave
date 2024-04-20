import { Request, Response } from 'express';
import Post from '../models/Post.js';
import formatDate from '../util/formatDate.js';

export const getPost = async (req: Request, res: Response): Promise<void> => {
  const posts = await Post.find();
  posts.forEach((p) => {
    p.toObject();
    p.date = formatDate(p.date);
    return p;
  });
  res.render('home', {
    posts: posts,
    pageTitle: 'Home',
    isAuthenticated: req.session.isLoggedIn,
  });
};

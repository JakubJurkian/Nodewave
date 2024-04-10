import { Request, Response, NextFunction } from 'express';
import Post from '../models/Post.js';

export const getPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const posts = await Post.find();
  posts.forEach((p) => {
    const dateString = p.date;
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    p.toObject();
    p.date = `${day}-${month}-${year}`;
    return p;
  });
  res.render('home', {
    posts: posts,
    pageTitle: 'Home',
    isAuthenticated: req.session.isLoggedIn,
  });
};

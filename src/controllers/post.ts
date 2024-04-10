import { Request, Response, NextFunction } from 'express';
import Post from '../models/Post.js';

export const getPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const posts = await Post.find();
  posts.forEach((p) => {
    const dateString: string = p.date;
    const date: Date = new Date(dateString);

    const day: string = String(date.getDate()).padStart(2, '0');
    const month: string = String(date.getMonth() + 1).padStart(2, '0');
    const year: string = String(date.getFullYear());
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

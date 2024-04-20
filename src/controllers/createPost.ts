import { Request, Response } from 'express';
import Post from '../models/Post.js';
import { AuthenticatedRequest } from '../app.js';

export const getCreatePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.render('createPost', { pageTitle: 'Create Post' });
};

export const postCreatePost = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (!req.body.content) return res.redirect('/create-post');
  const content = req.body.content;

  const newPost = new Post({
    user: req.user.username,
    avatar: req.user.avatar,
    content,
    date: new Date(),
  });
  newPost.save();
  res.redirect('/');
};

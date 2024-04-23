import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import Post from '../models/Post.js';
import formatDate from '../util/formatDate.js';
import { AuthenticatedRequest } from '../app.js';

export const getPost = async (req: Request, res: Response): Promise<void> => {
  let post = await Post.findById(req.params.postId);
  if (post) {
    post.toObject();
    post.date = formatDate(post.date);
  } else {
    return res.redirect('/');
  }

  res.render('post-details', {
    post,
    pageTitle: 'Post',
  });
};

export const getPosts = async (req: Request, res: Response): Promise<void> => {
  const posts = await Post.find();
  posts.forEach((p) => {
    p.toObject();
    p.date = formatDate(p.date);
    return p;
  });
  res.render('home', {
    posts: posts,
    pageTitle: 'Home',
  });
};

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array()[0].msg);
    return res.status(422).render('createPost', { pageTitle: 'Create Post' });
  }

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

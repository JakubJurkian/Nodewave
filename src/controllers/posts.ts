import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

import Post from '../models/Post.js';
import formatDate from '../util/formatDate.js';
import { AuthenticatedRequest } from '../app.js';
import User from '../models/User.js';

export const getPost = async (req: Request, res: Response): Promise<void> => {
  let post = await Post.findById(req.params.postId);
  if (post) {
    post.toObject();
    post.date = formatDate(post.date);
  } else {
    return res.redirect('/');
  }

  res.render('posts/post-details', {
    post,
    pageTitle: 'Post',
  });
};

export const getPosts = async (_: Request, res: Response): Promise<void> => {
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

export const getUserPosts = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const username = req.params.username;
  console.log(username);

  const user = await User.findOne({ username });
  if (user) {
    const userData = {
      username: user.username,
      avatar: `/${user.avatar.replace(/\\/g, '/')}`,
    };

    const userPosts = await Post.find({ user: username });

    userPosts.forEach((p) => {
      p.toObject();
      p.date = formatDate(p.date);
      return p;
    });

    res.render('posts/postsOfUser', {
      pageTitle: `Posts of ${username}`,
      posts: userPosts,
      user: userData,
      isCreator: userData.username === req.user.username,
    });
  } else {
    res.status(500).render('500');
  }
};

export const getCreatePost = async (
  _: Request,
  res: Response
): Promise<void> => {
  res.render('posts/createPost', { pageTitle: 'Create Post', error: null });
};

export const postCreatePost = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array()[0].msg);
    const error = { msg: errors.array()[0].msg };
    return res
      .status(422)
      .render('posts/createPost', { pageTitle: 'Create Post', error });
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

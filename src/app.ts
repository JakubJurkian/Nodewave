import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

import homeRoutes from '../src/routes/home.js';
import profileRoutes from '../src/routes/myProfile.js';
import authRoutes from '../src/routes/auth.js';
import bodyParser from 'body-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import User from './models/User.js';

declare module 'express-session' {
  export interface SessionData {
    isLoggedIn: boolean;
    user: any;
  }
}

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = dirname(__filename);

const app: Express = express();

app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

dotenv.config();
const mongodb_connection: string = process.env.MONGO_CONNECTION!;

app.use(
  session({
    secret: 'supersecret',
    store: MongoStore.create({
      mongoUrl: mongodb_connection,
      collectionName: 'sessions',
    }),
    resave: false,
    saveUninitialized: false,
  })
);

interface AuthenticatedRequest extends Request {
  user?: any;
}

app.use((req: AuthenticatedRequest, res: Response, next: NextFunction): void | NextFunction => {
  if (!req.session.user) return next();

  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) return next();
      req.user = user;
      next();
    })
    .catch((err) => next(new Error(err)));
});

app.use((req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(join(__dirname, 'public')));
app.use('/src/images', express.static(join(__dirname, 'images')));

app.use(homeRoutes);
app.use(profileRoutes);
app.use(authRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.render('404', { pageTitle: '404' });
});

mongoose
  .connect(mongodb_connection!)
  .then(() => app.listen(3000))
  .catch((err) => console.log(err));

import express, { Express, Request, Response, NextFunction } from 'express';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import multer from 'multer';

import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

import profileRoutes from '../src/routes/myProfile.js';
import homeRoutes from '../src/routes/home.js';
import authRoutes from '../src/routes/auth.js';
import User from './models/User.js';

declare module 'express-session' {
  export interface SessionData {
    isLoggedIn: boolean;
    user: any;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: any;
}

const app: Express = express();

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

dotenv.config();
const mongodbConnection: string = process.env.MONGO_CONNECTION!;

if (!mongodbConnection) {
  console.error('MONGO_CONNECTION environment variable not found.');
  process.exit(1);
}

const sessionSecret: string =
  process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex');

app.use(
  session({
    secret: sessionSecret,
    store: MongoStore.create({
      mongoUrl: mongodbConnection,
      collectionName: 'sessions',
    }),
    resave: false,
    saveUninitialized: false,
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(join(__dirname, 'public')));
app.use('/src/images', express.static(join(__dirname, 'images')));

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'src/images'),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExt = extname(file.originalname);
    const newFilename = `${file.fieldname}-${uniqueSuffix}${fileExt}`;
    cb(null, newFilename);
  },
});
app.use(multer({ storage: fileStorage }).single('image'));

app.use((req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

app.use(
  async (
    req: AuthenticatedRequest,
    _,
    next: NextFunction
  ): Promise<void | NextFunction> => {
    if (!req.session.user) return next();
    try {
      const user = await User.findById(req.session.user._id);
      req.user = user;
      next();
    } catch (err) {
      next(err);
    }
  }
);

app.use(homeRoutes);
app.use(profileRoutes);
app.use(authRoutes);

app.use((_, res: Response) => {
  res.render('404', { pageTitle: '404' });
});

mongoose
  .connect(mongodbConnection)
  .then(() => app.listen(3000))
  .catch((err) => console.log(err));

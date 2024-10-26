import express, { Express, Request, Response, NextFunction } from 'express';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import multer from 'multer';
import 'dotenv/config';

import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

import authRoutes from './routes/auth.js';
import indexRoutes from './routes/index.js';
import postRoutes from './routes/posts.js';
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
app.set('views', join(__dirname, '../views'));

const mongodbConnection: string | undefined = process.env.MONGO_CONNECTION;

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
app.use(express.static(join(__dirname.replace('dist', 'src'), 'public')));

//images/files upload
const fileStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, join(__dirname, '../src/public/images')),
  filename: (_, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileExt = extname(file.originalname);
    const newFilename = `${file.fieldname}-${uniqueSuffix}${fileExt}`;
    cb(null, newFilename);
  },
});
app.use(multer({ storage: fileStorage }).single('image'));

app.use((req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  //this allows to use isAuthenticated in ejs 'by default'
  //I don't have to pass isAuthenticated: req.session.isLoggedIn to render method anymore
  next();
});

app.use(
  async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void | NextFunction> => {
    if (!req.session.user) return next();
    try {
      req.user = await User.findById(req.session.user._id);
      req.user.avatar = req.user.avatar.replace(/\\/g, '/');
      console.log(req.user);
      next();
    } catch (err) {
      res.status(500).render('500');
    }
  }
);

app.use(indexRoutes);
app.use(authRoutes);
app.use(postRoutes);

app.use((_, res: Response) => {
  res.render('404', { pageTitle: '404' });
});

mongoose
  .connect(mongodbConnection)
  .then(() => app.listen(process.env.PORT || 3000))
  .catch((err) => console.log(err));

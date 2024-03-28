import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

import homeRoutes from '../src/routes/home.js';
import profileRoutes from '../src/routes/myProfile.js';
import authRoutes from '../src/routes/auth.js';

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = dirname(__filename);

const app: Express = express();

app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

app.use(express.static(join(__dirname, 'public')));
app.use('/src/images', express.static(join(__dirname, 'images')));


app.use(homeRoutes);
app.use(profileRoutes);
app.use(authRoutes);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.render('404', { pageTitle: '404' });
});

dotenv.config();
const mongodb_connection = process.env.MONGO_CONNECTION;
mongoose
  .connect(mongodb_connection!)
  .then(() => app.listen(3000))
  .catch((err) => console.log(err));

import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

import express from 'express';


import homeRoutes from '../src/routes/home.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

app.use(express.static(join(__dirname, 'public')));

app.use(homeRoutes);

app.listen(3000);
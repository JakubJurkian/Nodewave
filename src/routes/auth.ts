import express from 'express';

const router = express.Router();

router.get('/signup', (req, res, next) => {
  res.render('signup', { pageTitle: 'Signup' });
});

router.get('/login', (req, res, next) => {
    res.render('login', { pageTitle: 'Login' });
  });

export default router;
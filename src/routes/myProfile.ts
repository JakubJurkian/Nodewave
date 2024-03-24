import express from 'express';

const router = express.Router();

router.get('/my-profile', (req, res, next) => {
  res.render('myProfile');
});

export default router;
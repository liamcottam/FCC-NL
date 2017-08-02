const router = require('express').Router();
const logger = require('../core/logger');

router.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

router.use('/auth', require('./auth'));
router.use('/profiles', require('./profiles'));
router.use('/account', require('./account'));
router.use('/places', require('./places'));

router.use((err, req, res, next) => {
  if (err.name === 'InputValidationError') {
    return res.status(400).json(err);
  }

  if (err.message === 'YelpApiError') {
    return res.status(503).json({ name: err.message });
  }

  logger.error('Express: UnhandledException', err);
  return res.status(500).json({ name: 'UnhandledException' });
});

router.use((req, res, next) => {
  logger.warn('Express:', `Error 404 - ${req.url}`);
  res.status(404).json({ name: 'NotFound', msg: 'Could not find resource requested' });
});

module.exports = router;

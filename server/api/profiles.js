const router = require('express').Router();

const auth = require('../core/auth');
const User = require('../models/User');

router.use((req, res, next) => {
  req.ip_addr = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(',')[0].split(':').slice(-1)[0];
  next();
});

// Get profile
router.get('/:id', auth.optional, (req, res, next) => {
  req.assert('id', 'Invalid ID').isAlphanumeric().matches(/^[a-f\d]{24}$/i);

  req.getValidationResult()
    .then((result) => {
      if (!result.isEmpty()) throw { name: 'InputValidationError', errors: result.array() };
      return User.findById(req.params.id, { _id: 1, username: 1 }).exec();
    })
    .then((user) => {
      if (user) {
        res.status(200).end();
      } else {
        res.status(404).json({ msg: `Could not a profile with the id ${req.params.id}` });
      }
    }).catch(next);
});

module.exports = router;

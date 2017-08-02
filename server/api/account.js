const router = require('express').Router();
const expressValidator = require('express-validator');

const auth = require('../core/auth');
const User = require('../models/User');

router.patch('/', auth.required, (req, res, next) => {
  req.assert('old_password', '6 to 64 characters required').len(6, 64);
  req.assert('new_password', '6 to 64 characters required').len(6, 64);

  req.getValidationResult()
    .then((result) => {
      if (!result.isEmpty()) throw { name: 'InputValidationError', errors: result.array() };
      return User.findById(req.token.id).exec();
    }).then((user) => {
      if (user) {
        // Update the password
        if (user.checkPassword(req.body.old_password)) {
          user.password_hash = User.calculatePassword(req.body.new_password);
          user.save().then(() => res.status(200).end()).catch(err => res.status(500).json({ error: 'Could not save password' }));
        } else {
          return res.status(401).json({ error: 'Invalid Password' });
        }
      } else {
        return res.status(401).json({ error: 'No such user exists' });
      }
    }).catch(next);
});

module.exports = router;

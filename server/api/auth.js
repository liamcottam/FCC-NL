const router = require('express').Router();
const expressValidator = require('express-validator');

const logger = require('../core/logger');
const auth = require('../core/auth');
const passport = require('../core/passport');
const User = require('../models/User');
const Token = require('../models/Token');

router.post('/login', (req, res, next) => {
  req.assert('username', 'required').notEmpty();
  req.assert('password', 'required').notEmpty();
  req.assert('username', '1 to 15 characters required').len(1, 64);
  req.assert('password', '6 to 64 characters required').len(6, 64);

  req.getValidationResult()
    .then((result) => {
      if (!result.isEmpty()) throw { name: 'InputValidationError', errors: result.array() };
      return User.findOne({ username: req.body.username }).exec();
    }).then((user) => {
      if (user) {
        return user.login(req.body.password);
      }
      return User.create(req.body.username, req.body.password);
    }).then(token => res.json(token)).catch(next);
});

router.post('/token', (req, res, next) => {
  req.assert('id', 'required').notEmpty();
  req.assert('token', 'required').notEmpty();

  req.getValidationResult()
    .then((result) => {
      if (!result.isEmpty()) return res.status(401).json({ error: 'Invalid Data' });
      return Token.findOneAndRemove({ _id: req.body.id, token: req.body.token }).exec();
    }).then((token) => {
      if (token) {
        return res.json(token.value);
      }
      return res.status(401).json({ error: 'Invalid Data' });
    }).catch(next);
});

router.get('/github', passport.authenticate('github'));
router.get('/twitter', passport.authenticate('twitter'));

router.get('/github/callback', (req, res, next) => {
  passport.authenticate('github', (err, user) => {
    logger.error(err);
    if (err) return res.status(401).json({ error: 'Not Authenticated' });
    req.login(user, (err) => {
      logger.error(err);
      if (err) return res.status(401).json({ error: 'Not Authenticated' });
      Token.createToken(user.toAuthJSON()).then((token) => {
        res.redirect(`/login?id=${token.id}&token=${token.token}`);
      }).catch((err) => {
        console.error(err);
        return res.status(401).json({ error: 'Not Authenticated' });
      });
    });
  })(req, res, next);
});

router.get('/twitter/callback', (req, res, next) => {
  passport.authenticate('twitter', (err, user) => {
    logger.error(err);
    if (err) return res.status(401).json({ error: 'Not Authenticated' });
    req.login(user, (err) => {
      logger.error(err);
      if (err) return res.status(401).json({ error: 'Not Authenticated' });
      Token.createToken(user.toAuthJSON()).then((token) => {
        res.redirect(`/login?id=${token.id}&token=${token.token}`);
      }).catch((err) => {
        console.error(err);
        return res.status(401).json({ error: 'Not Authenticated' });
      });
    });
  })(req, res, next);
});

module.exports = router;

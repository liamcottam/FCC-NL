const fs = require('fs');
const router = require('express').Router();
const expressValidator = require('express-validator');
const ValidationError = require('./ValidationError');
const testdata = require('./testdata');
const auth = require('../core/auth');
const Checkin = require('../models/Checkin');
const request = require('request');

function processYelpResponse(data, userId) {
  return new Promise((resolve, reject) => {
    const response = data.search.business.map((o) => {
      return {
        id: o.id,
        name: o.name,
        lat: (o.coordinates && o.coordinates.latitude) ? o.coordinates.latitude : null,
        lng: (o.coordinates && o.coordinates.longitude) ? o.coordinates.longitude : null,
        snippet: (o.reviews) ? o.reviews[0].text.replace('\n', '') : null,
        image_url: (o.photos[0] !== 'https://s3-media3.fl.yelpcdn.com/bphoto/None/o.jpg') ? o.photos[0].replace('o.jpg', 'ms.jpg') : 'http://via.placeholder.com/100.jpg',
        going: 0,
      }
    });

    Checkin.findByYelpId(response, userId).then((db_merged) => {
      resolve(response);
    }).catch((err) => {
      reject(err);
    });
  });
}

function requestYelpData(lat, lng) {
  return new Promise((resolve, reject) => {
    request({
      url: 'https://api.yelp.com/v3/graphql',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.YELP_API_TOKEN}`,
        'Content-Type': 'application/graphql',
        'Accept-Language': 'en_GB',
      },
      body: `{search(categories:"bars",latitude:${lat},longitude:${lng},sort_by:"distance"){business{id,name,photos,coordinates{latitude,longitude},reviews{rating,text}}}}`,
    }, function (err, response) {
      if (err) return reject(err);
      resolve(JSON.parse(response.body).data);
    });
  });
}

router.get('/', auth.optional, (req, res, next) => {
  req.assert('lat', 'required').notEmpty();
  req.assert('lng', 'required').notEmpty();
  req.assert('lat', 'needs to be a float').isFloat();
  req.assert('lng', 'needs to be a float').isFloat();

  req.getValidationResult()
    .then((result) => {
      if (!result.isEmpty()) throw new ValidationError(result.mapped());
      return requestYelpData(req.query.lat, req.query.lng);
    }).then((data) => {
      return processYelpResponse(data, (req.token) ? req.token.id : null);
    }).then((data) => {
      res.json(data);
    }).catch(next);
});

router.post('/', auth.required, (req, res, next) => {
  req.assert('id', 'required').notEmpty();

  Checkin.findOne({ user_id: req.token.id, yelp_id: req.body.id }, (err, checkin) => {
    if (err) return next(new Error('MongoDB Error'));
    if (!checkin) {
      var checkin = new Checkin({ user_id: req.token.id, yelp_id: req.body.id });
      checkin.save().then(() => {
        Checkin.count({ yelp_id: req.body.id }).then((count) => {
          res.status(200).json(count);
        });
      }).catch(next);
    } else {
      Checkin.remove({ _id: checkin._id }, (err) => {
        if (err) return next(new Error('MongoDB Error'));
        Checkin.count({ yelp_id: req.body.id }).then((count) => {
          res.status(200).json(count);
        });
      });
    }
  });
});

module.exports = router;

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CheckinSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    required: true,
  },
  yelp_id: {
    type: String,
    required: true,
    index: true,
  },
});

CheckinSchema.statics.findByYelpId = function findByYelp(yelpData, userId) {
  const self = this;
  return new Promise((resolve, reject) => {
    // Get the list of IDs from the yelp data.
    const idMap = yelpData.map(o => o.id);
    self.find({
      yelp_id: {
        $in: idMap
      }
    }, (err, checkins) => {
      if (err) return reject(err);

      checkins.forEach((checkin) => {
        // Combine the arrays
        const idx = yelpData.findIndex(o => o.id === checkin.yelp_id);
        yelpData[idx].going++;
        if (userId !== null && checkin.user_id.equals(userId)) {
          yelpData[idx].is_user = true;
        }
      });

      resolve(yelpData);
    });
  });
};

module.exports = mongoose.model('Checkin', CheckinSchema);

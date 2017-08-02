const mongoose = require('mongoose');
const logger = require('./logger');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI, { useMongoClient: true })
  .then(() => logger.info('Connected to database'))
  .catch((err) => {
    logger.error(`Database connection error: ${err.message}`);
    process.exit(1);
  });

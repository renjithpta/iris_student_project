const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const trimRequest = require('trim-request');
const logger = require('morgan');
const multer = require('multer');
const debug = require('debug')('app:express');
//const passport = require('passport');
const { ServerError } = require('../utils/core');
const { authRouter } = require('./router/auth');
const { requestRouter } = require('./router/request');
const { electionDataRouter } = require('./router/electiondata');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const fs = require('fs');
const app = express();
const path = require('path');
app.use(helmet({
  crossdomain: true,
  referrerPolicy: true,
  hidePoweredBy: { setTo: 'PHP 4.2.0' },
}));
//app.use(passport.initialize());
app.use(cors());
app.use(bodyParser.json({ limit: '200mb', strict: false }));
app.use(trimRequest.all);

app.use(logger('dev'));
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
//app.use(multer().array('file', 5));

// eslint-disable-next-line no-unused-vars
app.get('/test', (req, res, next) => {
  res.json({ message: 'server is Up and Running!' });
});

app.use("/uploads", express.static("uploads"));
app.use('/auth', authRouter);
app.use('/voters', requestRouter);
app.use('/electiondata', electionDataRouter);

// 404 handler
app.use('*', (req, res, next) => {
  next(new ServerError('API_NOT_FOUND', 404));
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    return res.status(400).json({
      message: 'please use the property "file" to upload your documents',
    });
  }
  if (!err.status) {
    debug(err);
    return res.status(500).json({ message: 'server error' });
  }
  debug('Custom Server Error >', err.message);
  return res.status(err.status).json({ message: err.message, status: err.status });
});

module.exports = { app };

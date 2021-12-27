const express = require('express');

const logger = require('morgan');
const cors = require('cors');

const indexRouter = require('./routes/api');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());

app.use('/api', indexRouter);

module.exports = app;

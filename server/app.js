var express = require('express');

var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/api');

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());

app.use('/api', indexRouter);

module.exports = app;

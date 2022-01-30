const express = require('express');

const logger = require('morgan');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());

app.use(express.static('public'));

module.exports = app;

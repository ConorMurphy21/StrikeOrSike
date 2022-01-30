const express = require('express');

const logger = require('morgan');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());

app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

app.get('/*', function(req, res){
    res.sendFile( path.join(__dirname, 'public/index.html'));
});

module.exports = app;

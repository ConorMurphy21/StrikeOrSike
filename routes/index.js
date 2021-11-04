var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/create_game', function(req, res, next) {
  console.log('game created!');
  res.send({success: true});
});

router.post('/join_game', function(req, res, next) {
  res.send({success: true});
});


module.exports = router;

var express = require('express');
const {createRoom, isRoomJoinable, getRoom} = require("../models/model");
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index');
});

router.post('/create_game', function (req, res, next) {
    // Todo: validate input
    const room = createRoom(req.body.name, req.body.roomName.toLowerCase());
    // store name in session variable
    req.session.name = req.body.name;
    if (room.error) {
        // Todo: redirect on error
        res.sendStatus(404);
    } else {
        res.send({success: true});
    }

});

router.post('/join_game', function (req, res, next) {
    // Todo: validate input
    const room = isRoomJoinable(req.body.name, req.body.roomName.toLowerCase());
    // store name in session variable
    req.session.name = req.body.name;
    if (room.error) {
        // Todo: redirect on error
        res.sendStatus(404);
    } else {
        res.send({success: true});
    }
});

router.get('/:roomName', function (req, res, next) {
    // Todo: validate room
    const room = getRoom(req.params.roomName);

    if (!room) {
        res.redirect('/');
        return;
    }

    // if player doesn't have a name redirect them to join page with room filled in
    if(!req.session.name){
        req.session.room = req.params.roomName;
        res.redirect('/');
        return;
    }
    const player = room.players.find(player => player.name === req.session.name);

    res.render('game', {name: req.session.name, roomName: room.name});
});


module.exports = router;

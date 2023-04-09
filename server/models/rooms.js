const {GameState} = require('./gameState');
const parameterize = require('parameterize');
const locale = require("locale");

const supportedLocales = new locale.Locales(['en-CA'], 'en-CA');

// map model to rooms
const playerRoom = {}

// map rooms to model
const rooms = {}

const isValidName = (name) => {
    if(typeof name !== 'string')
        return { error: 'noName' };
    if(name.length < 2)
        return { error: 'shortName' };
    if(name.length > 20)
        return { error: 'longName' };

    return { success: true };
}

const isValidRoomName = (name) => {
    if(typeof name !== 'string')
        return { error: 'noRoomName' };
    if(name.length < 2)
        return { error: 'shortRoomName' };
    if(name.length > 15)
        return { error: 'longRoomName' };
    if (rooms[name])
        return { error: 'roomTaken' };
    return { success: true };
}


const createRoom = (id, name, roomName, langs) => {
    let result = isValidName(name);
    if (!result.success)
        return result;
    roomName = parameterize(roomName);
    result = isValidRoomName(roomName);
    if (!result.success)
        return result;

    const locales = new locale.Locales(langs);

    // clone default room
    const room = {
        name: roomName,
        lastActivity: (new Date()).getTime(),
        lang: locales.best(supportedLocales).code,
        players: [{
            id,
            name,
            leader: true,
            active: true,
        }]
    };
    room.state = new GameState(room);
    rooms[roomName] = room;
    playerRoom[id] = room;
    return { room };
}

const joinRoom = (id, name, roomName) => {
    let result = isValidName(name);
    if (!result.success)
        return result;
    if(typeof roomName !== 'string') {
        return { error: 'noRoom' };
    }
    const room = rooms[parameterize(roomName)];
    if (!room)
        return { error: 'noRoom' };
    // don't hold spots for inactive players
    if(room.players.find(p => p.active).length >= room.state.options.maxPlayers) {
        return { error: 'noSpace' };
    }

    const existingPlayer = room.players.find(player => player.name === name);
    if(existingPlayer && existingPlayer.active){
        return { error: 'nameTaken' };
    } else if(existingPlayer){
        // if player disconnected, let them join back in as who they were previously
        const oldId = existingPlayer.id;
        playerRoom[id] = room;
        existingPlayer.active = true;
        existingPlayer.id = id;
        return { room, oldId };
    }

    room.players.push({
        id,
        name,
        leader: false,
        active: true,
    });

    playerRoom[id] = room;
    return { room }
}

const getRoomByName = roomName => {
    return rooms[roomName];
}

const getRoomById = id => {
    return playerRoom[id];
}

const disconnectPlayer = id => {
    const room = playerRoom[id];
    if(!room)
        return;
    delete playerRoom[id];
    const player = room.players.find(player => player.id === id);
    player.active = false;
    // if no model are still active delete the room
    const activePlayer = room.players.find(player => player.active);
    if(!activePlayer) {
        clearTimeout(room.state.promptTimeout);
        delete rooms[room.name];
    } else {
        room.state.disconnect(id);
        if(player.leader) {
            player.leader = false;
            activePlayer.leader = true;
        }
    }
}

// cleanup all data concerning inactive rooms
// return list of rooms removed
const roomService = (maxInactivity) => {
    const time = (new Date).getTime();

    const inactiveRooms = [];
    for(const name in rooms){
        const room = rooms[name];
        if(time - room.lastActivity > maxInactivity){
            inactiveRooms.push(name);
            clearTimeout(room.state.promptTimeout);
            // delete the player record of the room
            for(const player of room.players){
                delete playerRoom[player.id];
            }
        }
    }
    for(const name of inactiveRooms){
        delete rooms[name];
    }

    return inactiveRooms;
}

const getCount = () => {
    return {rooms: Object.keys(rooms).length, players: Object.keys(playerRoom).length};
}

module.exports = {createRoom, joinRoom, getRoomById, getRoomByName, disconnectPlayer, roomService, getCount}
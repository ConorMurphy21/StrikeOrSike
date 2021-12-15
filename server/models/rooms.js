const GameState = require('./gameState');

// map model to rooms
const playerRoom = {}

// map rooms to model
const rooms = {}

const createRoom = (id, name, roomName) => {
    if (rooms[roomName])
        return { error: "roomTaken" };
    if (!name)
        return { error: "badName" };
    if (!roomName)
        return { error: "badRoom" };
    roomName = roomName.toLowerCase();

    // clone default room
    const room = {
        name: roomName,
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
    if (!roomName)
        return { error: "badRoom" };
    if (!name)
        return { error: "badName" };
    const room = rooms[roomName.toLowerCase()];
    if (!room)
        return { error: "noRoom" };

    const existingPlayer = room.players.find(player => player.name === name);
    if(existingPlayer && existingPlayer.active){
        return { error: "nameTaken" };
    } else if(existingPlayer){
        // if player disconnected, let them join back in as who they were previously
        playerRoom[id] = room;
        existingPlayer.active = true;
        existingPlayer.id = id;
        return { room };
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
        delete rooms[room.name];
    } else if(player.leader) {
        room.state.disconnect(id);
        player.leader = false;
        activePlayer.leader = true;
    }
}

const printState = () => {
    console.log("------------------------------------------")
    console.log("playerRoom: ", JSON.stringify(playerRoom, null, 2));
    //console.log("rooms: ", JSON.stringify(rooms, null, 2));
    console.log("------------------------------------------")
}

module.exports = {createRoom, joinRoom, getRoomById, getRoomByName, disconnectPlayer, printState}
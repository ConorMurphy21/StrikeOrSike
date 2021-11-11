// map model to rooms
const playerRoom = {}

// map rooms to model
const rooms = {}

const DEFAULT_ROOM = {
    name: "",
    players: []
}

const createRoom = (id, name, roomName) => {
    if (rooms[roomName])
        return { error: "roomTaken" };
    if (!name)
        return { error: "badName" };
    if (!roomName)
        return { error: "badRoom" };
    roomName = roomName.toLowerCase();

    // clone default room
    const room = { ...DEFAULT_ROOM };
    room.name = roomName;
    rooms[roomName] = room;
    room.players.push({
       id,
       name,
       leader: true,
       active: true,
    });
    return { room };
}

const joinRoom = (id, name, roomName) => {
    if (!roomName)
        return { error: "badRoom" };
    if (!name)
        return { error: "badName" };
    const room = rooms[roomName];
    if (!room)
        return { error: "noRoom" };

    const existingPlayer = room.players.find(player => player.name === name);
    if(existingPlayer && existingPlayer.active){
        return { error: "nameTaken" };
    } else if(existingPlayer){
        // if player disconnected, let them join back in as who they were previously
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
    playerRoom.remove(id);
    const player = room.players.find(player => player.id === id);
    player.active = false;
    // if no model are still active delete the room
    const activePlayer = room.players.find(player => player.active);
    if(!activePlayer)
        rooms.remove(room.name);
    if(player.leader)
        activePlayer.leader = true;

}


module.exports = {createRoom, joinRoom, getRoomById, getRoomByName, disconnectPlayer}
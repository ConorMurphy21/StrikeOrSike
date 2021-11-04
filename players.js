const players = []

const addPlayer = (id, name, room) => {
    const existingUser = players.find(
        user => user.name.trim().toLowerCase() === name.trim().toLowerCase() &&
            user.room === user.room
    )

    if (existingUser) return { error: "Username has already been taken" }
    if (!name && !room) return { error: "Username and room are required" }
    if (!name) return { error: "Username is required" }
    if (!room) return { error: "Room is required" }

    const user = { id, name, room }
    players.push(user)
    return { user }
}

const getPlayer = id => {
    return players.find(user => user.id === id)
}

const deletePlayer = (id) => {
    const index = players.findIndex((user) => user.id === id);
    if (index !== -1) return players.splice(index, 1)[0];
}

const getPlayers = (room) => players.filter(user => user.room === room)

module.exports = { addUser: addPlayer, getUser: getPlayer, deleteUser: deletePlayer, getUsers: getPlayers }
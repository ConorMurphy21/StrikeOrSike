//with { "type": "commonjs" } in your package.json

const {createServer} = require("http");
const {Server} = require("socket.io");
const Client = require("socket.io-client");
const assert = require("chai").assert;

describe("lobby tests", () => {
    let io, clientSocket1, clientSocket2;
    beforeEach((done) => {
        const httpServer = createServer();
        io = new Server(httpServer);
        httpServer.listen(() => {
            const port = httpServer.address().port;
            require('../../routes/gamesockets')(io);
            clientSocket1 = new Client(`http://localhost:${port}`);
            clientSocket1.on("connect", () => {
                clientSocket2 = new Client(`http://localhost:${port}`);
                clientSocket2.on("connect", done);
            });
        });
    });
    afterEach(() => {
        io.close();
        clientSocket1.close();
        clientSocket2.close();
    });

    it("create room happy updatePlayers", (done) => {
        clientSocket1.on("updatePlayers", (arg) => {
            assert.deepEqual(arg.deletes, []);
            assert.isOk(arg.modifies);
            const modded = arg.modifies[0];
            assert.isOk(modded)
            delete modded['id'];
            assert.deepEqual(modded, {name: "name", leader: true, active: true});
            done();
        });
        clientSocket1.emit("createRoom", "name", "room");
    });

    it("join room happy updatePlayers", (done) => {
        clientSocket2.on("updatePlayers", (arg) => {
            assert.deepEqual(arg.deletes, []);
            assert.isOk(arg.modifies);
            assert.strictEqual(arg.modifies.length, 2);
            const modded1 = arg.modifies[0];
            delete modded1['id'];
            const modded2 = arg.modifies[1];
            delete modded2['id'];
            assert.deepEqual(modded1, {name: "name1", leader: true, active: true});
            assert.deepEqual(modded2, {name: "name2", leader: false, active: true});
            done();
        });
        clientSocket1.on("joinRoom", (arg) => {
            clientSocket2.emit("joinRoom", "name2", "room");
        });
        clientSocket1.emit("createRoom", "name1", "room");
    });

    it("join room disconnect", (done) => {
        clientSocket2.on("joinRoom", (arg) => {
            assert.deepEqual(arg, {success: true});
            clientSocket2.disconnect();
        });
        clientSocket1.on("joinRoom", (arg) => {
            assert.deepEqual(arg, {success: true});
            clientSocket2.emit("joinRoom", "name2", "room");
        });
        let nupdates = 0;
        clientSocket1.on("updatePlayers", (arg) => {
            assert.deepEqual(arg.deletes, []);
            assert.isOk(arg.modifies);
            const modded = arg.modifies[0];
            assert.isOk(modded);
            delete modded['id'];
            if (nupdates === 0) {
                assert.deepEqual(modded, {name: "name1", leader: true, active: true});
            } else if (nupdates === 1) {
                assert.deepEqual(modded, {name: "name2", leader: false, active: true});
            } else {
                assert.deepEqual(modded, {name: "name2", leader: false, active: false});
                done();
            }
            nupdates++;
        });
        clientSocket1.emit("createRoom", "name1", "room");
    });

});

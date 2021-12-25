const {createServer} = require("http");
const {Server} = require("socket.io");
const Client = require("socket.io-client");
const registerHandlers = require("../../routes/socketio/registerHandlers");

const assert = require("chai").assert;

describe("Validation tests", () =>{
    let io, clientSocket1, clientSocket2, port;
    beforeEach((done) => {
        const httpServer = createServer();
        io = new Server(httpServer);
        httpServer.listen(() => {
            port = httpServer.address().port;
            io.on("connection", (socket) => registerHandlers(io, socket));

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
    it("room name spaces replaced", (done) => {
        clientSocket1.on("joinRoom", (arg) => {
            assert.deepEqual(arg, {success: true, roomName: "hello-world"});
            done();
        });
        clientSocket1.emit("createRoom", "name", "hello world");
    });

    it("allow non-ascii characters", (done) => {
        clientSocket1.on("joinRoom", (arg) => {
            assert.deepEqual(arg, {success: true, roomName: "😅"});
            done();
        });
        clientSocket1.emit("createRoom", "name", "😅");
    });

    it("allow non-ascii characters with spaces", (done) => {
        clientSocket1.on("joinRoom", (arg) => {
            assert.deepEqual(arg, {success: true, roomName: "hello-world-😅"});
            done();
        });
        clientSocket1.emit("createRoom", "name", "hello world 😅");
    });

})

describe("create/join tests", () => {
    let io, clientSocket1, clientSocket2, port;
    beforeEach((done) => {
        const httpServer = createServer();
        io = new Server(httpServer);
        httpServer.listen(() => {
            port = httpServer.address().port;
            io.on("connection", (socket) => registerHandlers(io, socket));

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

    it("create room happy", (done) => {
        clientSocket1.on("joinRoom", (arg) => {
            assert.deepEqual(arg, {success: true, roomName: "room"});
            done();
        });
        clientSocket1.emit("createRoom", "name", "room");
    });

    it("join room happy", (done) => {
        clientSocket2.on("joinRoom", (arg) => {
            assert.deepEqual(arg, {success: true, roomName: "room"});
            done();
        });
        clientSocket1.on("joinRoom", (arg) => {
            clientSocket2.emit("joinRoom", "name2", "room");
        });
        clientSocket1.emit("createRoom", "name1", "room");
    });

    it("join room capitalized 1", (done) => {
        clientSocket2.on("joinRoom", (arg) => {
            assert.deepEqual(arg, {success: true, roomName: "room"});
            done();
        });
        clientSocket1.on("joinRoom", (arg) => {
            clientSocket2.emit("joinRoom", "name2", "room");
        });
        clientSocket1.emit("createRoom", "name1", "Room");
    });

    it("join room capitalized 2", (done) => {
        clientSocket2.on("joinRoom", (arg) => {
            assert.deepEqual(arg, {success: true, roomName: "room"});
            done();
        });
        clientSocket1.on("joinRoom", (arg) => {
            clientSocket2.emit("joinRoom", "name2", "ROOM");
        });
        clientSocket1.emit("createRoom", "name1", "Room");
    });

    it("join room noRoom", (done) => {
        clientSocket1.on("joinRoom", (arg) => {
            assert.deepEqual(arg, {error: "noRoom"})
            done();
        });
        clientSocket1.emit("joinRoom", "name", "room");
    });

    it("create room roomTaken", (done) => {
        clientSocket2.on("joinRoom", (arg) => {
            assert.deepEqual(arg, {error: "roomTaken"});
            done();
        });
        clientSocket1.on("joinRoom", (arg) => {
            clientSocket2.emit("createRoom", "name2", "room");
        });
        clientSocket1.emit("createRoom", "name1", "room");
    });

    it("join room nameTaken", (done) => {
        clientSocket2.on("joinRoom", (arg) => {
            assert.deepEqual(arg, {error: "nameTaken"});
            done();
        });
        clientSocket1.on("joinRoom", (arg) => {
            clientSocket2.emit("joinRoom", "name", "room");
        });
        clientSocket1.emit("createRoom", "name", "room");
    });

    it("create room roomTaken prev", (done) => {
        clientSocket2.on("joinRoom", (arg) => {
            assert.deepEqual(arg, {success: true, roomName: "room"});
            done();
        });
        clientSocket1.on("joinRoom", (arg) => {
            assert.deepEqual(arg, {success: true, roomName: "room"});
            clientSocket1.disconnect();
        });
        clientSocket1.on("disconnect", () => {
            clientSocket2.emit("createRoom", "name", "room");
        });
        clientSocket1.emit("createRoom", "name", "room");
    });

    it("join room reconnect", (done) => {
        clientSocket2.on("joinRoom", (arg) => {
            clientSocket2.disconnect();
        });
        clientSocket1.on("joinRoom", (arg) => {
            clientSocket2.emit("joinRoom", "name2", "room");
        });
        clientSocket2.on("disconnect", () => {
            let clientSocket3 = new Client(`http://localhost:${port}`);
            clientSocket3.on("connect", () => {
                clientSocket3.emit("joinRoom", "name2", "room");
            });
            clientSocket3.on("joinRoom", (arg) => {
                assert.deepEqual(arg, {success: true, roomName: "room"});
                done();
            });
        });
        clientSocket1.emit("createRoom", "name1", "room");
    });

    it("join room double reconnect", (done) => {
        clientSocket2.on("joinRoom", (arg) => {
            clientSocket2.disconnect();
        });
        clientSocket1.on("joinRoom", (arg) => {
            clientSocket2.emit("joinRoom", "name2", "room");
        });
        clientSocket2.on("disconnect", () => {
            let clientSocket3 = new Client(`http://localhost:${port}`);
            clientSocket3.on("connect", () => {
                clientSocket3.emit("joinRoom", "name2", "room");
            });
            clientSocket3.on("joinRoom", (arg) => {
                clientSocket3.disconnect();
            });
            clientSocket3.on("disconnect", (arg) => {
                let clientSocket4 = new Client(`http://localhost:${port}`);
                clientSocket4.on("connect", () => {
                    clientSocket4.emit("joinRoom", "name2", "room");
                });
                clientSocket4.on("joinRoom", (arg) => {
                    assert.deepEqual(arg, {success: true, roomName: "room"});
                    done();
                });
            });
        });
        clientSocket1.emit("createRoom", "name1", "room");
    });


});
//with { 'type': 'commonjs' } in your package.json

const {createServer} = require('http');
const {Server} = require('socket.io');
const Client = require('socket.io-client');
const registerHandlers = require('../../routes/socketio/registerHandlers');
const assert = require('chai').assert;

describe('promptResponse tests', () => {
    const roomName = 'room';
    let io, clientSocket1, clientSocket2;
    beforeEach((done) => {
        const httpServer = createServer();
        io = new Server(httpServer);
        httpServer.listen(() => {
            const port = httpServer.address().port;
            io.on('connection', (socket) => registerHandlers(io, socket));
            clientSocket1 = new Client(`http://localhost:${port}`);
            clientSocket1.on('connect', () => {
                clientSocket2 = new Client(`http://localhost:${port}`);
                clientSocket2.on('connect', () => {
                    clientSocket1.on('joinRoom', () => {
                        clientSocket2.emit('joinRoom', 'name2', roomName);
                    });
                    clientSocket1.emit('createRoom', 'name1', roomName);
                });
                clientSocket2.on('joinRoom', () => {
                    clientSocket1.emit('setOptions', {promptTimer: 30, minPlayers: 1}, () => done());
                });
            });
        });
    });
    afterEach(() => {
        io.close();
        clientSocket1.close();
        clientSocket2.close();
    });

    it('startGame happy', (done) => {
        clientSocket1.on('beginPrompt', (data) => {
            assert.isString(data);
            done();
        });
        clientSocket1.emit('startGame');
    });

    it('startGame notLeader', (done) => {
        clientSocket1.on('beginPrompt', () => {
            assert.fail();
            done();
        });
        clientSocket2.emit('startGame');
        setTimeout(() => {
            done();
        }, 500);
    });

    it('promptResponse happy', (done) => {
        clientSocket1.on('beginPrompt', (data) => {
            clientSocket1.emit('promptResponse', 'response');
        });
        clientSocket1.on('promptResponse', response => {
            assert.strictEqual(response, 'response');
            done();
        })
        clientSocket1.emit('startGame');
    });

    it('promptResponse tooLate', (done) => {
        clientSocket1.on('beginPrompt', () => {
            clientSocket1.emit('promptResponse', 'forceSelection');
            setTimeout(() => {
                clientSocket1.emit('promptResponse', 'response');
                setTimeout(() => {
                    done();
                }, 200);
            }, 600);
        });
        clientSocket1.on('promptResponse', (response) => {
            assert.strictEqual(response, 'forceSelection');
        });
        clientSocket1.emit('setOptions', {promptTimer: 0}, () => {
            clientSocket1.emit('startGame');
        });
    });
});

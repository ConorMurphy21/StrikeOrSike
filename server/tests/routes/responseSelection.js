//with { 'type': 'commonjs' } in your package.json

const {createServer} = require('http');
const {Server} = require('socket.io');
const Client = require('socket.io-client');
const registerHandlers = require('../../routes/socketio/registerHandlers');
const assert = require('chai').assert;

const SHARED_RESPONSE = 'sharedResponse';
const C1_RESPONSE = 'c1Response';
const C2_RESPONSE = 'c2Response';

describe('responseSelection tests', () => {
    const roomName = 'room';
    let io, clientSocket1, clientSocket2, c1Id, c2Id;
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

                    clientSocket1.on('updatePlayers', (data) => {
                        data.modifies.forEach(player => {
                           if(player.name === 'name1') c1Id = player.id;
                           else c2Id = player.id;
                        });
                    });
                    clientSocket1.on('joinRoom', () => {
                        clientSocket2.emit('joinRoom', 'name2', roomName);

                    });
                    clientSocket2.on('joinRoom', () => {
                        clientSocket1.emit('setOptions', {promptTimer: 0, minPlayers: 1}, () => done());
                    });
                    clientSocket1.on('beginPrompt', () => {
                        clientSocket1.emit('promptResponse', SHARED_RESPONSE);
                        clientSocket2.emit('promptResponse', SHARED_RESPONSE);
                        clientSocket1.emit('promptResponse', C1_RESPONSE);
                        clientSocket2.emit('promptResponse', C2_RESPONSE);
                    });
                    clientSocket1.emit('createRoom', 'name1', roomName);
                });

            });
        });
    });
    afterEach(() => {
        io.close();
        clientSocket1.close();
        clientSocket2.close();
    });

    it('beginSelection happy', (done) => {
        clientSocket1.on('nextSelection', (data) => {
            assert.isOk(data.selector);
            assert.isOk(data.selectionType);
            done();
        });
        clientSocket1.emit('startGame');
    });

    it('makeSelection happy', (done) => {
        clientSocket1.on('nextSelection', (data) => {
            let selectingClient, selectingResponse;
            if(data.selector === c1Id){
                selectingClient = clientSocket1;
                selectingResponse = C1_RESPONSE;
            } else if(data.selector === c2Id){
                selectingClient = clientSocket2;
                selectingResponse = C2_RESPONSE;
            } else {
                assert.fail();
            }
            clientSocket1.on('beginMatching', (response) => {
                assert.strictEqual(selectingResponse, response);
            });
            clientSocket2.on('beginMatching', (response) => {
                assert.strictEqual(selectingResponse, response);
                done();
            });
            if(data.selectionType === 'choice'){
                selectingClient.emit('selectSelectionType', 'strike');
            }
            selectingClient.emit('selectResponse', selectingResponse);
        });
        clientSocket1.emit('startGame');
    });

    it('makeSelection wrongSelector', (done) => {
        clientSocket1.on('nextSelection', (data) => {
            let selectingClient, selectingResponse;
            if(data.selector === c1Id){
                selectingClient = clientSocket2;
                selectingResponse = C2_RESPONSE;
            } else if(data.selector === c2Id){
                selectingClient = clientSocket1;
                selectingResponse = C1_RESPONSE;
            } else {
                assert.fail();
            }
            clientSocket1.on('beginMatching', () => {
                assert.fail();
            });
            clientSocket2.on('beginMatching', () => {
                assert.fail();
            });
            if(data.selectionType === 'choice'){
                selectingClient.emit('selectSelectionType', 'strike');
            }
            selectingClient.emit('selectResponse', selectingResponse);
            setTimeout(done, 100);
        });
        clientSocket1.emit('startGame');
    });

    it('makeSelection invalidResponse', (done) => {
        clientSocket1.on('nextSelection', (data) => {
            let selectingClient, selectingResponse;
            if(data.selector === c1Id){
                selectingClient = clientSocket1;
                selectingResponse = C2_RESPONSE;
            } else if(data.selector === c2Id){
                selectingClient = clientSocket2;
                selectingResponse = C1_RESPONSE;
            } else {
                assert.fail();
            }
            clientSocket1.on('beginMatching', () => {
                assert.fail();
            });
            clientSocket2.on('beginMatching', () => {
                assert.fail();
            });
            if(data.selectionType === 'choice'){
                selectingClient.emit('selectSelectionType', 'strike');
            }
            selectingClient.emit('selectResponse', selectingResponse);
            setTimeout(done, 100);
        });
        clientSocket1.emit('startGame');
    });
});

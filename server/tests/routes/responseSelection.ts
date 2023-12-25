import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as ioc, Socket } from 'socket.io-client';
import { type AddressInfo } from 'node:net';
import { registerHandlers } from '../../src/routes/registerHandlers';
import { assert } from 'chai';
import { Player } from '../../src/models/rooms';

const SHARED_RESPONSE = 'sharedResponse';
const C1_RESPONSE = 'c1Response';
const C2_RESPONSE = 'c2Response';

describe('responseSelection tests', () => {
  const roomName = 'room';
  let io: Server, clientSocket1: Socket, clientSocket2: Socket, c1Id: string, c2Id: string;
  beforeEach((done) => {
    const httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      io.on('connection', (socket) => registerHandlers(io, socket));
      clientSocket1 = ioc(`http://localhost:${port}`);
      clientSocket1.on('connect', () => {
        clientSocket2 = ioc(`http://localhost:${port}`);
        clientSocket2.on('connect', () => {
          clientSocket1.on('updatePlayers', (data) => {
            data.modifies.forEach((player: Player) => {
              if (player.name === 'name1') c1Id = player.id;
              else c2Id = player.id;
            });
          });
          clientSocket1.on('joinRoom', () => {
            clientSocket2.emit('joinRoom', 'name2', roomName);
          });
          clientSocket2.on('joinRoom', () => {
            clientSocket1.emit('setOptions', { promptTimer: 0, minPlayers: 1 }, () => done());
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
      let selectingClient: Socket, selectingResponse: string;
      if (data.selector === c1Id) {
        selectingClient = clientSocket1;
        selectingResponse = C1_RESPONSE;
      } else if (data.selector === c2Id) {
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
      if (data.selectionType === 'choice') {
        selectingClient.emit('selectSelectionType', 'strike');
      }
      selectingClient.emit('selectResponse', selectingResponse);
    });
    clientSocket1.emit('startGame');
  });

  it('makeSelection wrongSelector', (done) => {
    clientSocket1.on('nextSelection', (data) => {
      let selectingClient, selectingResponse;
      if (data.selector === c1Id) {
        selectingClient = clientSocket2;
        selectingResponse = C2_RESPONSE;
      } else if (data.selector === c2Id) {
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
      if (data.selectionType === 'choice') {
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
      if (data.selector === c1Id) {
        selectingClient = clientSocket1;
        selectingResponse = C2_RESPONSE;
      } else if (data.selector === c2Id) {
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
      if (data.selectionType === 'choice') {
        selectingClient.emit('selectSelectionType', 'strike');
      }
      selectingClient.emit('selectResponse', selectingResponse);
      setTimeout(done, 100);
    });
    clientSocket1.emit('startGame');
  });
});

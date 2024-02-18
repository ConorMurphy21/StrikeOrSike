// noinspection JSUnusedGlobalSymbols
import { type Router, useRouter } from 'vue-router';
import socket from '@/socket/socket.js';
import { acceptHMRUpdate, defineStore } from 'pinia';
import type { Player } from ':common/stateTypes.js';

interface State {
  players: Player[];
  name: string;
  roomName: string;
  error: string;
  receivedError: boolean;
  route: string;
  router: Router;
}

export const useRoomStore = defineStore('room', {
  state: (): State => ({
    players: [],
    name: '',
    roomName: '',
    error: '',
    receivedError: false,
    route: 'home',
    router: useRouter()
  }),
  getters: {
    self(): Player | undefined {
      return this.players.find((p: Player) => p.name === this.name);
    }
  },
  actions: {
    setName(name: string) {
      this.name = name;
    },
    setError(error: string) {
      this.error = error;
    },
    bindEvents() {
      socket.on('connect', () => {
        // automatically try to rejoin last room if a reconnect event occurs
        if (this.name && this.roomName) {
          socket.emit('joinRoom', this.name, this.roomName);
        }
      });

      socket.on('updatePlayers', (data: { modifies: Player[]; deletes: string[] }) => {
        data.modifies.forEach((player) => {
          const i = this.players.findIndex((p: Player) => p.name === player.name);
          if (i < 0) this.players.push(player);
          else this.players[i] = player;
        });
        this.players = this.players.filter((player: Player) => !data.deletes.includes(player.id));
      });

      socket.on('joinRoom', async (data: { success: boolean; roomName: string; error: string }) => {
        if (data.success) {
          this.roomName = data.roomName;
          this.error = '';
          await this.router.push({
            name: 'game',
            params: { roomName: data.roomName }
          });
        } else {
          if (this.route !== 'home') {
            await this.router.push({
              name: 'home',
              params: { error: data.error }
            });
          } else {
            this.error = data.error;
            this.receivedError = true;
            setTimeout(() => {
              this.receivedError = false;
            }, 1000);
          }
        }
      });

      socket.on('kickPlayer', async (data: { error: string }) => {
        await this.router.push({ name: 'home', query: { error: data.error } });
      });
    }
  }
});

// allow hot module reloading of the room store
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    acceptHMRUpdate(useRoomStore, import.meta.hot)(newModule);
    // unfortunately can't unbind all listeners because game would be effected
    // and can't rebind game because of circular dependancy
    // so each socket listener has to be offed manually
    socket.off('connect');
    socket.off('updatePlayers');
    socket.off('joinRoom');
    socket.off('kickPlayer');
    useRoomStore().bindEvents();
  });
}

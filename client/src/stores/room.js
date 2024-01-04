// noinspection JSUnusedGlobalSymbols
import router from "@/router/index.js";
import socket from "@/socket/socket.js";
import { defineStore } from "pinia";

export const useRoomStore = defineStore("room", {
  state: () => ({
    players: [],
    name: "",
    roomName: "",
    error: "",
    receivedError: false,
    route: "home"
  }),
  getters: {
    self() {
      return this.players.find(p => p.name === this.name);
    }
  },
  actions: {
    setName(name) {
      this.name = name;
    },
    setRoomName(roomName) {
      this.roomName = roomName;
    },
    setError(error) {
      this.error = error;
    },
    bindEvents() {

      socket.on("connect", () => {
        // automatically try to rejoin last room if a reconnect event occurs
        if (this.name && this.roomName) {
          socket.emit("joinRoom", this.name, this.roomName);
        }
      });

      socket.on("updatePlayers", (data) => {
        data.modifies.forEach(player => {
          const i = this.players.findIndex(p => p.name === player.name);
          if (i < 0)
            this.players.push(player);
          else
            this.players[i] = player;

        });
        this.players = this.players.filter(player => !data.deletes.includes(player.id));
      });

      socket.on("joinRoom", async (data) => {
        if (data.success) {
          this.roomName = data.roomName;
          this.error = "";
          await router.push({ name: "game", params: { roomName: data.roomName } });
        } else {
          if (this.route !== "home") {
            await router.push({ name: "home", params: { error: data.error } });
          } else {
            this.error = data.error;
            this.receivedError = true;
            setTimeout(() => {
              this.receivedError = false;
            }, 1000);
          }
        }
      });
    }
  }
});
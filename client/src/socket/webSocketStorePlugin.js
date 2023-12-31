export default function createWebSocketPlugin (socket) {
  return (store) => {

    socket.on('updatePlayers', data => {
      store.commit('room/SOCKET_updatePlayers', data);
    });

    socket.on('connect', () => {
      store.dispatch('room/SOCKET_connect');
    });

    socket.on('joinRoom', data => {
      store.dispatch('room/SOCKET_joinRoom', data);
    });

    socket.on('setOptions', options => {
      store.commit('game/SOCKET_setOptions', options);
    });

    socket.on('selectionTypeChosen', selectionType => {
      store.commit('game/SOCKET_selectionTypeChosen', selectionType);
    });

    socket.on('setVoteCount', data => {
      store.commit('game/SOCKET_setVoteCount', data);
    });

    socket.on('beginPrompt', prompt => {
      store.dispatch('game/SOCKET_beginPrompt', prompt);
    });

    socket.on('promptResponse', response => {
      store.dispatch('game/SOCKET_promptResponse', response);
    });

    socket.on('nextSelection', data => {
      store.dispatch('game/SOCKET_nextSelection', data);
    });

    socket.on('beginMatching', response => {
      store.dispatch('game/SOCKET_beginMatching', response);
    });

    socket.on('matchesFound', matches => {
      store.dispatch('game/SOCKET_matchesFound', matches);
    });

    socket.on('endRound', data => {
      store.dispatch('game/SOCKET_endRound', data);
    });

    socket.on('gameOver', data => {
      store.dispatch('game/SOCKET_gameOver', data);
    });

    socket.on('midgameConnect', data => {
      store.dispatch('game/SOCKET_midgameConnect', data);
    });
  }
}

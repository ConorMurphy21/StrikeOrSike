import io, { Socket } from "socket.io-client";

let socket: Socket;
if (process.env.NODE_ENV !== 'production') {
  socket = io('http://localhost:5000', {withCredentials: false});
} else {
  socket = io(location.origin, {withCredentials: false});
}
export default socket;
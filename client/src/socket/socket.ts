import io from 'socket.io-client';
import type { TypedClientSocket } from ':common/socketioTypes';

let socket: TypedClientSocket;
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socket = io('http://localhost:5000', { withCredentials: false }) as any as TypedClientSocket;
} else {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  socket = io(location.origin, { withCredentials: false }) as any as TypedClientSocket;
}
export default socket;

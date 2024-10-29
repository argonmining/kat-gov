import { w3cwebsocket } from 'websocket';

declare global {
  interface WebSocket extends w3cwebsocket {}
}

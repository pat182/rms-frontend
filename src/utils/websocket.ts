import { WS_URL } from '../config'
export function connectAdminWebSocket(
  wsRoute: string,
  onMessage: (data: any) => void,
) {
  console.log("Connecting to route:", wsRoute);

  const socket = new WebSocket(
    `${WS_URL}/${wsRoute}`,
  );

  socket.onopen = () => {
    console.log("WebSocket connected");
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log("Received:", message);
    onMessage(message);
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onclose = (event) => {
    console.log("WebSocket disconnected:", event.code, event.reason);
  };

  return socket;
}
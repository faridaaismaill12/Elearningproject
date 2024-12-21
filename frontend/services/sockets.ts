import { io, Socket } from "socket.io-client";

let socket: Socket;

// Ensure `localStorage` is accessed only on the client side
if (typeof window !== "undefined") {
  const token = localStorage.getItem("authToken");
  console.log("token", token);
  socket = io("http://localhost:4000", {
    query: { token },
  });
} else {
  socket = io("http://localhost:4000"); // Use default socket without token during SSR
}

export default socket;

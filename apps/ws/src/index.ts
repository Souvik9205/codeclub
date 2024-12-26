import { WebSocketServer } from "ws";
import { User } from "./utils/User";

const wss = new WebSocketServer({ port: 8080 });

console.log("WebSocket server is starting on port 8080");

wss.on("connection", function connection(ws) {
  let user = new User(ws);
  ws.on("error", (error) => {
    console.error("WebSocket Error:", error);
  });

  ws.on("close", () => {
    user?.destroy();
  });
});

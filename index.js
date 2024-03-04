import { createServer } from "http";
import { parse } from "url";
import { WebSocket, WebSocketServer } from "ws";

const server = createServer();
const wss1 = new WebSocketServer({ noServer: true });

const rooms = new Map();
const users = new Map();
wss1.on("connection", function connection(ws, request) {
  const uuuid = Math.random() * 100;
  ws.on("error", console.error);
  ws.on("message", (data, isBinary) => {
    handleMessage(ws, data);
  });
  ws.on("close", () => {
    console.log("user disconnect successfully");
  });
});

const handleMessage = (ws, data) => {
  try {
    if (data) {
      const message = JSON.parse(data);
      console.log("call the fuction of the join room", message);
      if (message.type === "join_room") {
        console.log("called the function successfully");
        joinRoom(ws, message.roomId);
      } else if (message.type === "leave_room") {
        leaveRoom(ws, message.roomId);
      } else if (message.type === "send_message") {
        sendMessage(message.roomId, message);
      }
    }
  } catch (error) {
    console.error("Invalid json format");
  }
};
const sendMessage = (roomId, message) => {
  console.log("send the message", roomId, message);
  if (rooms.has(roomId)) {
    rooms.get(roomId).map((soc) => {
      soc.send(JSON.stringify(message));
    });
  } else {
    return;
  }
};
const joinRoom = (ws, roomId) => {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, []);
  }
  // rooms.get(roomId).add(ws);
  rooms.get(roomId).push(ws);
  broadcastToRoom(roomId, {
    type: "info",
    message: "New user added successfully",
  });
};
function broadcastToRoom(roomId, message) {
  console.log("broad cast the mesage", message);
  console.log("this is the rooms", rooms);
  if (rooms.has(roomId)) {
    rooms.get(roomId).map((soc) => {
      soc.send(JSON.stringify(message));
    });
  } else {
    return;
  }
}
const leaveRoom = (ws, roomId) => {
  if (rooms.has(roomId)) {
    rooms.delete(roomId);
  } else {
    return;
  }
};
server.on("upgrade", function upgrade(request, socket, head) {
  // console.log("req headers", request.headers);
  wss1.handleUpgrade(request, socket, head, function done(ws) {
    wss1.emit("connection", ws, request);
  });
});

server.listen(8080, () => {
  console.log("application is listening on the port 8080");
});

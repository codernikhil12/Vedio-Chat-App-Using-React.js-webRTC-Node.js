const express = require("express");
const { Server } = require("socket.io");
const bodyparser = require("body-parser");

const io = new Server({
  cors: true,
});
const app = express();

app.use(bodyparser.json());

const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();

io.on("connection", (socket) => {
  console.log("New Connection");

  socket.on("join-room", (data) => {
    const { roomId, emailId } = data;
    console.log("user", emailId, "joined room", roomId);

    emailToSocketMapping.set(emailId, socket.id);
    socketToEmailMapping.set(socket.Id, emailId);
    socket.join(roomId);
    socket.emit("join-room", { roomId });
    socket.broadcast.to(roomId).emit("user-Joined", { emailId });
  });

  socket.on("call-user", (data) => {
    const { emailId, offer } = data;
    const socketId = emailToSocketMapping.get(emailId);
    socket.io(socketId).emit("incoming-call", { from: fromEmail, offer });
    const fromEmail = socketToEmailMapping.get(socketId);
  });

  socket.on("call-accepted", (data) => {
    const { emailId, ans } = data;
    const socketId = emailToSocketMapping.get(emailId);
    socket.to(socketId).emit("call-accepted", { ans });
  });
});

app.listen(8000, () => console.log("http server is running in 8000"));
io.listen(8001);

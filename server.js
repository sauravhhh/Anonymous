const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }
});

let waitingUsers = [];

io.on("connection", (socket) => {

  socket.on("join", (data) => {
    socket.gender = data.gender;
    socket.preference = data.preference;

    const matchIndex = waitingUsers.findIndex(user =>
      (user.gender === socket.preference || socket.preference === "any") &&
      (socket.gender === user.preference || user.preference === "any")
    );

    if (matchIndex !== -1) {
      const partner = waitingUsers.splice(matchIndex, 1)[0];
      const room = `room-${socket.id}-${partner.id}`;

      socket.join(room);
      partner.join(room);

      socket.room = room;
      partner.room = room;

      socket.emit("matched");
      partner.emit("matched");
    } else {
      waitingUsers.push(socket);
    }
  });

  socket.on("send_message", (data) => {
    if (socket.room) {
      socket.to(socket.room).emit("receive_message", data);
    }
  });

  socket.on("typing", () => {
    if (socket.room) {
      socket.to(socket.room).emit("typing");
    }
  });

  socket.on("next", () => {
    if (socket.room) {
      socket.to(socket.room).emit("stranger_disconnected");
      socket.leave(socket.room);
      socket.room = null;
    }
    socket.emit("rematch");
  });

  socket.on("disconnect", () => {
    waitingUsers = waitingUsers.filter(user => user !== socket);
    if (socket.room) {
      socket.to(socket.room).emit("stranger_disconnected");
    }
  });

});

server.listen(process.env.PORT || 3000);

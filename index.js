const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Store nicknames mapped to socket.id
const users = {};

io.on('connection', (socket) => {
  console.log("A user connected:", socket.id);

  // Step 1: Listen for nickname setup
  socket.on("set nickname", (nickname) => {
    users[socket.id] = nickname;
    console.log(`User ${socket.id} set nickname to ${nickname}`);
    io.emit("user joined", `${nickname} joined the chat`);
  });

  // Step 2: Handle messages with nickname
  socket.on("chat message", (msg) => {
    const name = users[socket.id] || "Anonymous";
    io.emit("chat message", { name, msg });
  });

  // Step 3: Cleanup on disconnect
  socket.on("disconnect", () => {
    const name = users[socket.id] || "Anonymous";
    console.log(`${name} disconnected`);
    io.emit("user left", `${name} left the chat`);
    delete users[socket.id];
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

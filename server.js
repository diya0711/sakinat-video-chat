const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("."));

let clients = [];

io.on("connection", (socket) => {
  console.log("Yangi foydalanuvchi ulandi");

  socket.on("join", () => {
    clients.push(socket);
    if (clients.length === 2) {
      clients[0].emit("ready");
      clients[1].emit("ready");
    }
  });

  socket.on("offer", (data) => {
    socket.broadcast.emit("offer", data);
  });

  socket.on("answer", (data) => {
    socket.broadcast.emit("answer", data);
  });

  socket.on("candidate", (data) => {
    socket.broadcast.emit("candidate", data);
  });

  socket.on("message", (msg) => {
    socket.broadcast.emit("message", msg);
  });

  socket.on("disconnect", () => {
    clients = clients.filter(s => s !== socket);
    console.log("Foydalanuvchi chiqdi");
  });
});

http.listen(3000, () => {
  console.log("Server ishga tushdi: http://localhost:3000");
});

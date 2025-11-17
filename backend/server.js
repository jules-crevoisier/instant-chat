const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());

const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


io.on("connection", (socket) => {
    console.log("Un utilisateur est connecté :", socket.id);

    socket.on("send_message", (data) => {
        console.log("Message reçu :", data);
        io.emit("receive_message", data);
    });
});

server.listen(3000, () => {
    console.log("Serveur avec Socket.IO lancé sur http://localhost:3000");
});
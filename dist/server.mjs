"use strict";
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler(); // will help us create a server
app.prepare().then(() => {
    const httpServer = createServer(handle);
    const io = new Server(httpServer);
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);
        socket.on("join-room", ({ roomId, username }) => {
            socket.join(roomId);
            console.log(`User ${username} joined room ${roomId}`);
            socket
                .to(roomId)
                .emit("user_joined", `${username} joined the conversation`);
        });
        socket.on("message", ({ roomId, message, sender }) => {
            console.log(`User ${sender} in room ${roomId} sent message: ${message}`);
            socket.to(roomId).emit("message", { sender, message });
        });
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
    httpServer.listen(port, () => {
        console.log(`> Server running on http://${hostname}:${port}`);
    });
});

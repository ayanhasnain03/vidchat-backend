import express from "express";
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "https://vidchat-client.vercel.app", // Default to localhost in dev
    methods: ["GET", "POST"],
  },
});

// Middleware for JSON data
app.use(express.json());

// Handle socket connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });

  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    console.log(`${userId} joined room: ${roomId}`);
    socket.to(roomId).emit("user-connected", userId);

    socket.on("send-message", (message) => {
      socket.to(roomId).emit("receive-message", message);
    });

    socket.on("offer", (offer) => {
      socket.to(roomId).emit("offer", offer);
    });

    socket.on("answer", (answer) => {
      socket.to(roomId).emit("answer", answer);
    });

    socket.on("ice-candidate", (candidate) => {
      socket.to(roomId).emit("ice-candidate", candidate);
    });

    socket.on("screen-share", (screenStream) => {
      socket.to(roomId).emit("screen-share", screenStream);
    });
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

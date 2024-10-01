import express from "express";
import { Server } from "socket.io";
import http from "http";

import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Express and Socket.IO setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://vidchat-client.vercel.app", // Ensure this is the correct client URL
    methods: ["GET", "POST"],
  },
});

app.use(express.json()); // To handle JSON data if needed

// Handle socket connections and events
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id); // Log the connection

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id); // Log when a user disconnects
  });

  socket.on("join-room", (roomId: string, userId: string) => {
    socket.join(roomId);
    console.log(`${userId} joined room: ${roomId}`);
    socket.to(roomId).emit("user-connected", userId);

    // Handle messages and WebRTC events
    socket.on("send-message", (message: string) => {
      console.log(`Message from ${userId} in room ${roomId}: ${message}`);
      socket.to(roomId).emit("receive-message", message);
    });

    socket.on("offer", (offer) => {
      console.log(`Offer sent in room ${roomId}`);
      socket.to(roomId).emit("offer", offer);
    });

    socket.on("answer", (answer) => {
      console.log(`Answer sent in room ${roomId}`);
      socket.to(roomId).emit("answer", answer);
    });

    socket.on("ice-candidate", (candidate) => {
      console.log(`ICE candidate sent in room ${roomId}`);
      socket.to(roomId).emit("ice-candidate", candidate);
    });

    socket.on("screen-share", (screenStream) => {
      console.log(`Screen sharing in room ${roomId}`);
      socket.to(roomId).emit("screen-share", screenStream);
    });
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

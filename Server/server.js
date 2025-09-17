const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

const users = new Map();
const adminSockets = new Set();

const pendingMessages = new Map();

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  socket.on("register", (data) => {
    if (data.type === "admin") {
      users.set(socket.id, { type: "admin" });
      adminSockets.add(socket.id);
      console.log("Admin registered:", socket.id);

      if (pendingMessages.size > 0) {
        pendingMessages.forEach((messages, userId) => {
          messages.forEach((message) => {
            socket.emit("new-message", {
              from: userId,
              message: message.text,
              timestamp: message.timestamp,
            });
          });
        });

        pendingMessages.clear();
      }
    } else {
      users.set(socket.id, { type: "user" });
      console.log("User registered:", socket.id);
    }
  });

  socket.on("user-message", (message) => {
    if (users.get(socket.id)?.type !== "user") return;

    console.log("User message:", message);

    if (adminSockets.size > 0) {
      adminSockets.forEach((adminId) => {
        io.to(adminId).emit("new-message", {
          from: socket.id,
          message: message,
          timestamp: new Date().toISOString(),
        });
      });
    } else {
      if (!pendingMessages.has(socket.id)) {
        pendingMessages.set(socket.id, []);
      }
      pendingMessages.get(socket.id).push({
        text: message,
        timestamp: new Date().toISOString(),
      });
      console.log("Message stored for offline admin");
    }
  });

  socket.on("admin-response", (data) => {
    if (users.get(socket.id)?.type !== "admin") return;

    console.log("Admin response to:", data.to, "message:", data.message);

    io.to(data.to).emit("response", {
      from: socket.id,
      message: data.message,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("register", (data) => {
    if (data.type === "admin") {
      users.set(socket.id, { type: "admin" });
      adminSockets.add(socket.id);
      console.log("Admin registered:", socket.id);

      io.emit("admin-status", "online");
    } else {
      users.set(socket.id, { type: "user" });
      console.log("User registered:", socket.id);

      const hasAdmins = adminSockets.size > 0;
      socket.emit("admin-status", hasAdmins ? "online" : "offline");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    if (users.get(socket.id)?.type === "admin") {
      adminSockets.delete(socket.id);

      if (adminSockets.size === 0) {
        io.emit("admin-status", "offline");
      }
    }
    users.delete(socket.id);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    if (users.get(socket.id)?.type === "admin") {
      adminSockets.delete(socket.id);
    }
    users.delete(socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT} and accessible from network`);
});

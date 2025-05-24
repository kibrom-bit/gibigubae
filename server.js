import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import participantRoutes from "./src/routes/participantRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import requestLogger from "./src/middleware/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(express.static("public"));

// Routes
app.use("/api", participantRoutes);
app.use("/api/admin", adminRoutes);

// Serve the admin page
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("\n=== Unhandled Error ===");
  console.error("Request ID:", req.requestId);
  console.error("Time:", new Date().toISOString());
  console.error("Error:", err.stack);
  console.error("==================\n");

  res.status(500).json({
    success: false,
    message: "ስህተት ተከስቷል። እባክዎ እንደገና ይሞክሩ።",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Modified server start logic
const startServer = (port) => {
  try {
    app
      .listen(port, () => {
        console.log(`Server running on port ${port}`);
      })
      .on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          console.log(`Port ${port} is busy, trying ${port + 1}`);
          startServer(port + 1);
        } else {
          console.error("Server error:", err);
        }
      });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

startServer(port);

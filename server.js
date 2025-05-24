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

// Static files
const publicPath = path.join(__dirname, "public");
console.log(`Serving static files from: ${publicPath}`);
app.use(express.static(publicPath));

// Explicit root route to serve index.html
app.get("/", (req, res) => {
  const indexPath = path.join(publicPath, "index.html");
  console.log(`Attempting to serve index.html from: ${indexPath}`);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("Error sending index.html:", err);
      res.status(err.status || 500).end();
    }
  });
});

// Routes
app.use("/api", participantRoutes);
app.use("/api/admin", adminRoutes);

// Serve the admin page
app.get("/admin", (req, res) => {
  const adminHtmlPath = path.join(publicPath, "admin.html");
  console.log(`Attempting to serve admin.html from: ${adminHtmlPath}`);
  res.sendFile(adminHtmlPath, (err) => {
    if (err) {
      console.error("Error sending admin.html:", err);
      res.status(err.status || 500).end();
    }
  });
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
const startServer = (portToTry) => {
  try {
    app
      .listen(portToTry, () => {
        console.log(`Server running on port ${portToTry}`);
      })
      .on("error", (err) => {
        if (err.code === "EADDRINUSE") {
          console.log(`Port ${portToTry} is busy, trying ${portToTry + 1}`);
          startServer(portToTry + 1);
        } else {
          console.error("Server error:", err);
        }
      });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

startServer(port);

import "dotenv/config";
import express from "express";
import pg from "pg";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Parse the DATABASE_URL
const dbUrl = new URL(process.env.DATABASE_URL);

// PostgreSQL configuration using Supabase
const pool = new Pool({
  user: dbUrl.username,
  password: dbUrl.password,
  host: dbUrl.hostname,
  port: dbUrl.port,
  database: dbUrl.pathname.split("/")[1],
  ssl: {
    rejectUnauthorized: false, // Required for Supabase connections
  },
});

// Test database connection
pool
  .connect()
  .then(() => console.log("Connected to database successfully"))
  .catch((err) => console.error("Database connection error:", err));

// Routes
app.post("/api/submit", async (req, res) => {
  try {
    const {
      first_name,
      father_name,
      gender,
      department,
      dorm_block,
      dorm_room_number,
      job_field,
      phone_number,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO event_participants (
        first_name,
        father_name,
        gender,
        department,
        dorm_block,
        dorm_room_number,
        job_field,
        phone_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        first_name,
        father_name,
        gender,
        department,
        dorm_block,
        dorm_room_number,
        job_field,
        phone_number,
      ]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error submitting data:", error);
    res.status(500).json({ success: false, message: "Error submitting data" });
  }
});

// Admin routes
app.post("/api/admin/auth", (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Invalid password" });
  }
});

app.get("/api/admin/data", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM event_participants ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ success: false, message: "Error fetching data" });
  }
});

// Serve the admin page
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong!" });
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

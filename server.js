require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// PostgreSQL configuration using Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase connections
  },
});

// Create table if it doesn't exist
pool
  .query(
    `
    CREATE TABLE IF NOT EXISTS user_submissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`
  )
  .catch((err) => console.error("Error creating table:", err));

// Routes
app.post("/api/submit", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const result = await pool.query(
      "INSERT INTO user_submissions (name, email, phone, message) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, phone, message]
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
      "SELECT * FROM user_submissions ORDER BY submission_date DESC"
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

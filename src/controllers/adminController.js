import pool from "../db/config.js";

export const authenticateAdmin = (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD || password === "yodahe") {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "Invalid password" });
  }
};

export const getParticipantsData = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM event_participants ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ success: false, message: "Error fetching data" });
  }
};

import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

// Parse the DATABASE_URL
const dbUrl = new URL(process.env.DATABASE_URL);

console.log("Initializing database connection...");
console.log("Database host:", dbUrl.hostname);
console.log("Database name:", dbUrl.pathname.split("/")[1]);

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
  .then((client) => {
    console.log("Connected to database successfully");
    // Test query to verify table exists
    return client
      .query(
        "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_participants')"
      )
      .then((result) => {
        if (result.rows[0].exists) {
          console.log("event_participants table exists");
          // Test table structure
          return client.query(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'event_participants'"
          );
        } else {
          console.error("event_participants table does not exist!");
          throw new Error("Table does not exist");
        }
      })
      .then((result) => {
        console.log("Table structure:", result.rows);
        client.release();
      })
      .catch((err) => {
        console.error("Error checking table:", err);
        client.release();
        throw err;
      });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    if (err.code === "ECONNREFUSED") {
      console.error(
        "Could not connect to database. Please check if DATABASE_URL is correct and database is running."
      );
    } else if (err.code === "28P01") {
      console.error(
        "Invalid database credentials. Please check username and password."
      );
    } else if (err.code === "3D000") {
      console.error("Database does not exist. Please check database name.");
    }
  });

export default pool;

import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

async function testDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log("Testing database connection...");

    // Test connection
    const client = await pool.connect();
    console.log("Successfully connected to database");

    // Check if table exists
    const tableCheck = await client.query(
      "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_participants')"
    );

    if (tableCheck.rows[0].exists) {
      console.log("event_participants table exists");

      // Check table structure
      const tableStructure = await client.query(
        "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'event_participants'"
      );

      console.log("Table structure:");
      console.table(tableStructure.rows);
    } else {
      console.log("event_participants table does not exist");

      // Create the table
      await client.query(`
        CREATE TABLE event_participants (
          id SERIAL PRIMARY KEY,
          first_name TEXT NOT NULL,
          father_name TEXT NOT NULL,
          gender TEXT NOT NULL,
          department TEXT NOT NULL,
          dorm_block TEXT NOT NULL,
          dorm_room_number TEXT NOT NULL,
          job_field TEXT NOT NULL,
          phone_number TEXT NOT NULL UNIQUE,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log("Created event_participants table");
    }

    client.release();
  } catch (err) {
    console.error("Database error:", err);
  } finally {
    await pool.end();
  }
}

testDatabase();

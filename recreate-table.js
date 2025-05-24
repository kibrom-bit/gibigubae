import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

async function recreateTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log("Connecting to database...");
    const client = await pool.connect();

    // Drop and recreate the table
    await client.query("DROP TABLE IF EXISTS event_participants");

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
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT phone_number_format CHECK (phone_number ~ '^0[0-9]{9}$')
      );

      COMMENT ON TABLE event_participants IS 'Stores registration information for event participants';
      COMMENT ON COLUMN event_participants.first_name IS 'ስም';
      COMMENT ON COLUMN event_participants.father_name IS 'የአባት ስም';
      COMMENT ON COLUMN event_participants.gender IS 'ጾታ';
      COMMENT ON COLUMN event_participants.department IS 'ዲፓርትመንት';
      COMMENT ON COLUMN event_participants.dorm_block IS 'ዶርም ብሎክ';
      COMMENT ON COLUMN event_participants.dorm_room_number IS 'ዶርም ክፍል ቁጥር';
      COMMENT ON COLUMN event_participants.job_field IS 'የሥራ መስክ';
      COMMENT ON COLUMN event_participants.phone_number IS 'ስልክ ቁጥር';
    `);

    console.log("Table recreated successfully");

    // Verify table structure
    const tableStructure = await client.query(
      "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'event_participants' ORDER BY ordinal_position"
    );

    console.log("\nNew table structure:");
    console.table(tableStructure.rows);

    client.release();
  } catch (err) {
    console.error("Database error:", err);
  } finally {
    await pool.end();
  }
}

recreateTable();

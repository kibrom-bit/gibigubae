import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

async function fixTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log("Connecting to database...");
    const client = await pool.connect();

    // Add missing columns if they don't exist
    const columnsToAdd = [
      "first_name TEXT NOT NULL DEFAULT ''",
      "father_name TEXT NOT NULL DEFAULT ''",
      "gender TEXT NOT NULL DEFAULT ''",
      "department TEXT NOT NULL DEFAULT ''",
      "dorm_block TEXT NOT NULL DEFAULT ''",
      "dorm_room_number TEXT NOT NULL DEFAULT ''",
    ];

    for (const column of columnsToAdd) {
      const columnName = column.split(" ")[0];
      try {
        // Check if column exists
        const columnCheck = await client.query(
          `
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'event_participants' 
          AND column_name = $1
        `,
          [columnName]
        );

        if (columnCheck.rows.length === 0) {
          // Column doesn't exist, add it
          console.log(`Adding missing column: ${columnName}`);
          await client.query(
            `ALTER TABLE event_participants ADD COLUMN ${column}`
          );
        } else {
          console.log(`Column ${columnName} already exists`);
        }
      } catch (err) {
        console.error(`Error handling column ${columnName}:`, err);
      }
    }

    // Verify table structure
    const tableStructure = await client.query(
      "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'event_participants'"
    );

    console.log("\nUpdated table structure:");
    console.table(tableStructure.rows);

    client.release();
  } catch (err) {
    console.error("Database error:", err);
  } finally {
    await pool.end();
  }
}

fixTable();

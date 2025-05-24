import pool from "../db/config.js";

// Helper function to log errors with request context
const logError = (error, context = {}) => {
  const timestamp = new Date().toISOString();
  console.log("\n=== Error Log ===");
  console.log("Timestamp:", timestamp);
  console.log("Context:", context);
  console.log("Error Name:", error.name);
  console.log("Error Message:", error.message);
  console.log("Error Code:", error.code);
  console.log("Error Stack:", error.stack);
  console.log("================\n");
};

export const submitParticipant = async (req, res) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log("\n=== New Registration Request ===");
  console.log("Request ID:", requestId);
  console.log("Time:", new Date().toISOString());

  try {
    console.log("Request Body:", {
      ...req.body,
      // Mask phone number for privacy in logs
      phone_number: req.body.phone_number
        ? "****" + req.body.phone_number.slice(-4)
        : undefined,
    });

    // Validate required fields
    const requiredFields = [
      "first_name",
      "father_name",
      "gender",
      "department",
      "dorm_block",
      "dorm_room_number",
      "job_field",
      "phone_number",
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      console.log("Validation Failed: Missing Fields:", missingFields);
      return res.status(400).json({
        success: false,
        message: "እባክዎ ሁሉንም መረጃዎች ያስገቡ።",
        details: `Missing fields: ${missingFields.join(", ")}`,
      });
    }

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

    // Log sanitized data
    console.log("Validated Data:", {
      first_name: first_name.trim(),
      father_name: father_name.trim(),
      gender,
      department: department.trim(),
      dorm_block: dorm_block.trim(),
      dorm_room_number: dorm_room_number.trim(),
      job_field,
      phone_number: "****" + phone_number.slice(-4),
    });

    // Validate phone number format
    const phoneRegex = /^0[0-9]{9}$/; // Ethiopian phone format: 0 followed by 9 digits
    if (!phoneRegex.test(phone_number)) {
      console.log(
        "Validation Failed: Invalid phone number format:",
        phone_number
      );
      return res.status(400).json({
        success: false,
        message: "እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ። (ምሳሌ: 0912345678)",
      });
    }

    console.log("Checking for existing phone number...");

    // First check if phone number already exists
    const existingUser = await pool.query(
      "SELECT phone_number FROM event_participants WHERE phone_number = $1",
      [phone_number]
    );

    if (existingUser.rows.length > 0) {
      console.log(
        "Duplicate phone number found:",
        "****" + phone_number.slice(-4)
      );
      return res.status(400).json({
        success: false,
        message: "ይህ ስልክ ቁጥር ከዚህ በፊት ተመዝግቧል።",
      });
    }

    console.log("Attempting database insertion...");

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
        first_name.trim(),
        father_name.trim(),
        gender,
        department.trim(),
        dorm_block.trim(),
        dorm_room_number.trim(),
        job_field,
        phone_number,
      ]
    );

    if (!result.rows[0]) {
      throw new Error("No data returned after insertion");
    }

    console.log("Registration successful!");
    console.log("Participant ID:", result.rows[0].id);
    console.log("=== End Registration Request ===\n");

    res.json({
      success: true,
      data: result.rows[0],
      message: "መረጃዎ በተሳካ ሁኔታ ተመዝግቧል። እናመሰግናለን!",
    });
  } catch (error) {
    logError(error, {
      requestId,
      operation: "submitParticipant",
      phoneNumber: req.body.phone_number
        ? "****" + req.body.phone_number.slice(-4)
        : undefined,
    });

    // Check for specific database errors
    if (error.code === "23505") {
      // Unique violation
      return res.status(400).json({
        success: false,
        message: "ይህ ስልክ ቁጥር ከዚህ በፊት ተመዝግቧል።",
      });
    }

    if (error.code === "23502") {
      // Not null violation
      return res.status(400).json({
        success: false,
        message: "እባክዎ ሁሉንም አስፈላጊ መረጃዎች ያስገቡ።",
      });
    }

    // Check if it's a connection error
    if (error.code === "ECONNREFUSED" || error.code === "57P01") {
      console.error("Database connection error");
      return res.status(503).json({
        success: false,
        message: "የዳታቤዝ ግንኙነት ችግር አለ። እባክዎ ቆይተው ይሞክሩ።",
      });
    }

    // Check for constraint violation
    if (error.code === "23514") {
      // Check constraint violation
      return res.status(400).json({
        success: false,
        message: "እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ። (ምሳሌ: 0912345678)",
      });
    }

    res.status(500).json({
      success: false,
      message: "ስህተት ተከስቷል። እባክዎ እንደገና ይሞክሩ።",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

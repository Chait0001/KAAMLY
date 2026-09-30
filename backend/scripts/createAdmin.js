// -----------------------------------------------------------
// One-time script to create an ADMIN user.
//
// Reads admin details from .env so you don't hardcode secrets.
// Usage:  node scripts/createAdmin.js
//
// This is the ONLY way to create an ADMIN account.
// The public /api/auth/signup endpoint always creates CUSTOMER.
// -----------------------------------------------------------

require("dotenv").config(); // load .env from the backend/ folder
const bcrypt = require("bcryptjs");
const pool = require("../src/config/db");

async function createAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD } = process.env;

  // Validate that all admin env vars are set
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PHONE || !ADMIN_PASSWORD) {
    console.error(
      "Missing admin env vars. Set ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD in .env"
    );
    process.exit(1);
  }

  try {
    // Check if an admin with this email already exists
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [ADMIN_EMAIL]
    );
    if (existing.length > 0) {
      console.log("Admin already exists with this email. Skipping.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await pool.query(
      "INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, 'ADMIN')",
      [ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, hashedPassword]
    );

    console.log(`Admin account created: ${ADMIN_EMAIL}`);
    process.exit(0);
  } catch (err) {
    console.error("Error creating admin:", err.message);
    process.exit(1);
  }
}

createAdmin();

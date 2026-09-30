const pool = require("../config/db");

// GET /api/health
// Returns { status: "ok", db: "connected" } when everything works,
// or { status: "ok", db: "unreachable", error: "..." } if MySQL is down.
// This lets you quickly tell whether the server AND database are healthy.
const getHealth = async (req, res) => {
  try {
    // "SELECT 1" is the lightest possible query — just checks the connection.
    await pool.query("SELECT 1");
    return res.json({ status: "ok", db: "connected" });
  } catch (err) {
    // Server is running but can't reach MySQL.
    return res.status(500).json({
      status: "ok",
      db: "unreachable",
      error: err.message,
    });
  }
};

module.exports = { getHealth };

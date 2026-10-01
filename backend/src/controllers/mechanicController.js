const pool = require("../config/db");

// -----------------------------------------------------------
// GET /api/mechanics/:id
// Get mechanic profile + their shop's services.
// -----------------------------------------------------------
const getMechanicDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get mechanic details
    const [mechanicRows] = await pool.query(
      `SELECT m.id, u.name, u.avatar_url, m.shop_id, sh.name AS shop_name, m.experience_yrs, m.specialisation, m.rating, m.total_reviews, m.visit_charge, m.is_available 
       FROM mechanics m
       JOIN users u ON m.user_id = u.id
       JOIN shops sh ON m.shop_id = sh.id
       WHERE m.id = ? AND m.verification_status = 'APPROVED' AND sh.status = 'ACTIVE'`,
      [id]
    );

    if (mechanicRows.length === 0) {
      return res.status(404).json({ error: "Mechanic not found or unverified." });
    }
    const mechanic = mechanicRows[0];

    // 2. Get shop services
    const [services] = await pool.query(
      `SELECT ss.id AS shop_service_id, s.id AS service_id, s.name, s.description, ss.price 
       FROM shop_services ss
       JOIN services s ON ss.service_id = s.id
       WHERE ss.shop_id = ?`,
      [mechanic.shop_id]
    );

    return res.json({
      mechanic,
      services
    });
  } catch (err) {
    console.error("Error in getMechanicDetails:", err);
    return res.status(500).json({ error: "Server error while fetching mechanic details." });
  }
};

module.exports = { getMechanicDetails };

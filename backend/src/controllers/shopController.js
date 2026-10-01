const pool = require("../config/db");

// -----------------------------------------------------------
// GET /api/shops
// List shops with distance, rating, mechanics info.
// -----------------------------------------------------------
const getShops = async (req, res) => {
  try {
    const { lat, lng, city, sort, page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    let query = `
      SELECT 
        s.id, s.name, s.area, s.city, s.rating, s.total_reviews, s.latitude, s.longitude,
        s.opening_time, s.closing_time,
        (CURRENT_TIME() BETWEEN s.opening_time AND s.closing_time) AS is_open_now,
        COUNT(m.id) AS mechanic_count,
        SUM(CASE WHEN m.is_available = 1 THEN 1 ELSE 0 END) AS available_mechanic_count
    `;
    const queryParams = [];

    // Distance calculation if lat/lng are provided
    if (lat && lng) {
      query += `, (6371 * acos(cos(radians(?)) * cos(radians(s.latitude)) * cos(radians(s.longitude) - radians(?)) + sin(radians(?)) * sin(radians(s.latitude)))) AS distance_km `;
      queryParams.push(lat, lng, lat);
    } else {
      query += `, NULL AS distance_km `;
    }

    query += `
      FROM shops s
      LEFT JOIN mechanics m ON s.id = m.shop_id AND m.verification_status = 'APPROVED'
      WHERE s.status = 'ACTIVE'
    `;

    if (city) {
      query += ` AND s.city = ? `;
      queryParams.push(city);
    }

    query += ` GROUP BY s.id `;

    // Sorting
    let orderBy = "s.id ASC";
    if (sort === "nearest" && lat && lng) {
      orderBy = "distance_km ASC";
    } else if (sort === "rating") {
      orderBy = "s.rating DESC";
    } else if (sort === "available") {
      orderBy = "available_mechanic_count DESC";
    } else if (lat && lng) {
       orderBy = "distance_km ASC"; // default to nearest if lat/lng are given
    }

    query += ` ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
    queryParams.push(limitNum, offset);

    const [shops] = await pool.query(query, queryParams);
    
    // Convert is_open_now to boolean
    const formattedShops = shops.map(shop => ({
      ...shop,
      is_open_now: !!shop.is_open_now
    }));

    return res.json({
      page: pageNum,
      limit: limitNum,
      data: formattedShops
    });
  } catch (err) {
    console.error("Error in getShops:", err);
    return res.status(500).json({ error: "Server error while fetching shops." });
  }
};

// -----------------------------------------------------------
// GET /api/shops/:id
// Get shop details, its mechanics, and its services.
// -----------------------------------------------------------
const getShopDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Get shop details
    const [shopRows] = await pool.query(
      `SELECT id, name, description, phone, address, city, area, latitude, longitude, rating, total_reviews, opening_time, closing_time, (CURRENT_TIME() BETWEEN opening_time AND closing_time) AS is_open_now, image_url 
       FROM shops 
       WHERE id = ? AND status = 'ACTIVE'`, 
      [id]
    );

    if (shopRows.length === 0) {
      return res.status(404).json({ error: "Shop not found or inactive." });
    }
    const shop = shopRows[0];
    shop.is_open_now = !!shop.is_open_now;

    // 2. Get approved mechanics
    const [mechanics] = await pool.query(
      `SELECT m.id, u.name, u.avatar_url, m.experience_yrs, m.specialisation, m.rating, m.total_reviews, m.visit_charge, m.is_available 
       FROM mechanics m
       JOIN users u ON m.user_id = u.id
       WHERE m.shop_id = ? AND m.verification_status = 'APPROVED'`,
      [id]
    );

    // 3. Get shop services
    const [services] = await pool.query(
      `SELECT ss.id AS shop_service_id, s.id AS service_id, s.name, s.description, ss.price 
       FROM shop_services ss
       JOIN services s ON ss.service_id = s.id
       WHERE ss.shop_id = ?`,
      [id]
    );

    return res.json({
      shop,
      mechanics,
      services
    });
  } catch (err) {
    console.error("Error in getShopDetails:", err);
    return res.status(500).json({ error: "Server error while fetching shop details." });
  }
};

// -----------------------------------------------------------
// GET /api/locations/search?q=...
// Search for distinct city/area matches from active shops.
// -----------------------------------------------------------
const searchLocations = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: "Query 'q' must be at least 2 characters." });
    }

    const searchQuery = `%${q.trim()}%`;
    const [locations] = await pool.query(
      `SELECT DISTINCT city, area 
       FROM shops 
       WHERE status = 'ACTIVE' AND (city LIKE ? OR area LIKE ?)
       LIMIT 10`,
      [searchQuery, searchQuery]
    );

    return res.json({ data: locations });
  } catch (err) {
    console.error("Error in searchLocations:", err);
    return res.status(500).json({ error: "Server error while searching locations." });
  }
};

module.exports = { getShops, getShopDetails, searchLocations };

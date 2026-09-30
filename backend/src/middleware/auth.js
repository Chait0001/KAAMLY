const jwt = require("jsonwebtoken");

// -----------------------------------------------------------
// verifyToken — checks that the request has a valid JWT.
//
// The mobile app sends the token in the "Authorization" header
// like this:  Authorization: Bearer <token>
// This middleware extracts it, verifies it, and attaches the
// decoded payload (userId, role) to req.user so downstream
// handlers can use it.
// -----------------------------------------------------------
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided. Please log in." });
  }

  // "Bearer eyJhbG..." → extract just the token part after the space
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach to request so controllers can read req.user.userId, req.user.role
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};

// -----------------------------------------------------------
// requireRole — restricts a route to specific roles.
//
// Usage:  router.get("/admin-only", verifyToken, requireRole("ADMIN"), handler)
//         router.get("/both", verifyToken, requireRole("CUSTOMER","MECHANIC"), handler)
//
// It's a function that RETURNS middleware (a "higher-order function").
// The ...roles syntax collects all arguments into an array.
// -----------------------------------------------------------
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated." });
    }
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: `Access denied. Required role: ${roles.join(" or ")}` });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };

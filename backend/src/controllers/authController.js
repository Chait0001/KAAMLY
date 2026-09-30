const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// -----------------------------------------------------------
// POST /api/auth/signup
// Creates a new CUSTOMER account. NEVER allows creating
// MECHANIC or ADMIN accounts (admin does that manually).
// -----------------------------------------------------------
const signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // ---- Input validation ----
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        error: "All fields are required: name, email, phone, password.",
      });
    }

    // Basic email format check (not exhaustive, but catches obvious typos)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    // Indian phone numbers: 10 digits, optionally prefixed with +91
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        error: "Invalid phone number. Use 10 digits starting with 6-9.",
      });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters." });
    }

    // ---- Check for duplicate email or phone ----
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ? OR phone = ?",
      [email, phone]
    );
    if (existing.length > 0) {
      return res
        .status(409) // 409 Conflict
        .json({ error: "An account with this email or phone already exists." });
    }

    // ---- Hash password ----
    // 10 = salt rounds — higher is slower but more secure; 10 is standard
    const hashedPassword = await bcrypt.hash(password, 10);

    // ---- Insert user (role is always CUSTOMER from signup) ----
    const [result] = await pool.query(
      "INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, 'CUSTOMER')",
      [name, email, phone, hashedPassword]
    );

    // Return the new user (without password hash)
    return res.status(201).json({
      message: "Account created successfully.",
      user: {
        id: result.insertId,
        name,
        email,
        phone,
        role: "CUSTOMER",
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
};

// -----------------------------------------------------------
// POST /api/auth/login
// Verifies email + password, returns a JWT and user info.
// -----------------------------------------------------------
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    // ---- Find user by email ----
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      // Vague message on purpose — don't reveal if the email exists
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = rows[0];

    // ---- Compare password against the stored hash ----
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // ---- Create JWT ----
    // Payload contains only userId and role — keep it small.
    // expiresIn: "7d" means the token is valid for 7 days.
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return token + user info (never the password hash)
    return res.json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
};

// -----------------------------------------------------------
// GET /api/auth/me
// Returns the logged-in user's profile. Requires a valid JWT
// (the verifyToken middleware runs before this).
// -----------------------------------------------------------
const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, phone, role, avatar_url, created_at FROM users WHERE id = ?",
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.json({ user: rows[0] });
  } catch (err) {
    console.error("GetMe error:", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
};

module.exports = { signup, login, getMe };

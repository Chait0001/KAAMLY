// Load .env FIRST — before any module reads process.env.
// require("dotenv").config() reads backend/.env and adds its keys to
// process.env so the rest of the app can use them.
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const healthRoutes = require("./routes/healthRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// ---- Global middleware ----

// cors()  — lets requests from other origins (the mobile app, admin dashboard)
//           reach this API. Without it the browser / device blocks the request.
app.use(cors());

// express.json() — parses incoming JSON bodies so req.body works.
// (Express 5 includes this; we call it explicitly for clarity.)
app.use(express.json());

// ---- Routes ----

// All routes are prefixed with /api so it's easy to add a reverse proxy later.
app.use("/api", healthRoutes);
app.use("/api", authRoutes);

// ---- Start server ----

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Kaamly backend running on http://localhost:${PORT}`);
});

// If the port is already in use (e.g. macOS AirPlay uses 5000), print a clear error and exit
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Please free up the port or change it in .env`);
    process.exit(1);
  }
  console.error(err);
});

const mysql = require("mysql2/promise");

// mysql2/promise gives us a pool that returns Promises instead of callbacks.
// A "pool" keeps a few connections open so each request doesn't wait to
// connect from scratch — much faster under load.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // waitForConnections: if all connections are busy, new requests wait
  // instead of failing immediately.
  waitForConnections: true,
  connectionLimit: 10, // max simultaneous connections
  queueLimit: 0, // 0 = unlimited waiting queue
});

module.exports = pool;

require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

(async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ Connection OK:", res.rows[0]);
  } catch (err) {
    console.error("❌ Database error:", err);
  } finally {
    await pool.end();
    console.log("🔒 Pool closed");
  }
})();

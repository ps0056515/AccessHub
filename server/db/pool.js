const { Pool } = require("pg");
const config = require("../config");

const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30_000,
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error", err);
});

module.exports = pool;

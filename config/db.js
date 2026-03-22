const { Pool } = require("pg");

function buildPoolConfig() {
  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL };
  }

  return {
    user: process.env.PGUSER || process.env.DB_USER,
    password: process.env.PGPASSWORD ?? process.env.DB_PASSWORD,
    host: process.env.PGHOST || process.env.DB_HOST || "localhost",
    port: Number(process.env.PGPORT || process.env.DB_PORT) || 5432,
    database: process.env.PGDATABASE || process.env.DB_NAME,
  };
}

const pool = new Pool(buildPoolConfig());

module.exports = pool;

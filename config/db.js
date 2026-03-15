const { Pool } = require("pg");

const pool = new Pool({
  user: "dhyeyl",
  host: "localhost",
  database: "feature_flags",
  port: 5432,
});

module.exports = pool;
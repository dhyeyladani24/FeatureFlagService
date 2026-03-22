/**
 * node-pg can mis-handle multiple JSON/JSONB parameters when JS arrays are involved.
 * We send one JSON text blob and let Postgres extract jsonb fields with ->'key'.
 */
const targetsEnvelope = (users, countries) =>
  JSON.stringify({
    u: Array.isArray(users) ? users : [],
    c: Array.isArray(countries) ? countries : [],
  });

const normalizeTargets = (row) => {
  if (!row) return row;
  return {
    ...row,
    target_users: Array.isArray(row.target_users) ? row.target_users : [],
    target_countries: Array.isArray(row.target_countries)
      ? row.target_countries
      : [],
  };
};

module.exports = {
  targetsEnvelope,
  normalizeTargets,
};

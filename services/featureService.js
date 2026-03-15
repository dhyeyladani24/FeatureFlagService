const db = require("../config/db");
const {
  getFeatureFromCache,
  setFeatureInCache,
  deleteFeatureFromCache,
} = require("./cacheService");
const { logAudit } = require("./auditService");

const createFeature = async (data) => {
  const {
    name,
    environment,
    enabled = false,
    rollout_percentage = 0,
    target_users = [],
    target_countries = [],
  } = data;

  const result = await db.query(
    `INSERT INTO feature_flags
      (name, environment, enabled, rollout_percentage, target_users, target_countries)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, environment, enabled, rollout_percentage, target_users, target_countries]
  );

  const created = result.rows[0];

  await setFeatureInCache(created);

  await logAudit({
    featureName: created.name,
    environment: created.environment,
    action: "CREATE",
    oldValue: null,
    newValue: created,
  });

  return created;
};

const getFeature = async (name, environment) => {
  const cached = await getFeatureFromCache(name, environment);
  if (cached) return { feature: cached, source: "cache" };

  const result = await db.query(
    `SELECT * FROM feature_flags WHERE name = $1 AND environment = $2`,
    [name, environment]
  );

  if (result.rows.length === 0) return null;

  const feature = result.rows[0];
  await setFeatureInCache(feature);

  return { feature, source: "database" };
};

const updateFeature = async (name, environment, updates) => {
  const existingResult = await db.query(
    `SELECT * FROM feature_flags WHERE name = $1 AND environment = $2`,
    [name, environment]
  );

  if (existingResult.rows.length === 0) {
    return null;
  }

  const existing = existingResult.rows[0];

  const updatedValues = {
    enabled:
      updates.enabled !== undefined ? updates.enabled : existing.enabled,
    rollout_percentage:
      updates.rollout_percentage !== undefined
        ? updates.rollout_percentage
        : existing.rollout_percentage,
    target_users:
      updates.target_users !== undefined
        ? updates.target_users
        : existing.target_users,
    target_countries:
      updates.target_countries !== undefined
        ? updates.target_countries
        : existing.target_countries,
  };

  const result = await db.query(
    `UPDATE feature_flags
     SET enabled = $1,
         rollout_percentage = $2,
         target_users = $3,
         target_countries = $4,
         updated_at = CURRENT_TIMESTAMP
     WHERE name = $5 AND environment = $6
     RETURNING *`,
    [
      updatedValues.enabled,
      updatedValues.rollout_percentage,
      updatedValues.target_users,
      updatedValues.target_countries,
      name,
      environment,
    ]
  );

  const updated = result.rows[0];

  await deleteFeatureFromCache(name, environment);
  await setFeatureInCache(updated);

  await logAudit({
    featureName: updated.name,
    environment: updated.environment,
    action: "UPDATE",
    oldValue: existing,
    newValue: updated,
  });

  return updated;
};

const getAllFeatures = async (environment) => {
  let query = `SELECT * FROM feature_flags`;
  let values = [];

  if (environment) {
    query += ` WHERE environment = $1`;
    values.push(environment);
  }

  query += ` ORDER BY id DESC`;

  const result = await db.query(query, values);
  return result.rows;
};

const getAuditLogs = async () => {
  const result = await db.query(
    `SELECT * FROM audit_logs ORDER BY changed_at DESC`
  );
  return result.rows;
};

module.exports = {
  createFeature,
  getFeature,
  updateFeature,
  getAllFeatures,
  getAuditLogs,
};
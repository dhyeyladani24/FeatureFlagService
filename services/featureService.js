const db = require("../config/db");
const {
  getFeatureFromCache,
  setFeatureInCache,
  deleteFeatureFromCache,
} = require("./cacheService");
const { logAudit } = require("./auditService");
const { targetsEnvelope, normalizeTargets } = require("../utils/featureTargets");

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
     VALUES ($1, $2, $3, $4, ($5::jsonb->'u'), ($5::jsonb->'c'))
     RETURNING *`,
    [
      name,
      environment,
      enabled,
      rollout_percentage,
      targetsEnvelope(target_users, target_countries),
    ]
  );

  const created = normalizeTargets(result.rows[0]);

  await setFeatureInCache(created, name, environment);

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
  if (cached) {
    return { feature: normalizeTargets(cached), source: "cache" };
  }

  const result = await db.query(
    `SELECT * FROM feature_flags WHERE name = $1 AND environment = $2`,
    [name, environment]
  );

  if (result.rows.length === 0) return null;

  const feature = normalizeTargets(result.rows[0]);
  await setFeatureInCache(feature, name, environment);

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

  const existing = normalizeTargets(existingResult.rows[0]);

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
         target_users = ($3::jsonb->'u'),
         target_countries = ($3::jsonb->'c'),
         updated_at = CURRENT_TIMESTAMP
     WHERE name = $4 AND environment = $5
     RETURNING *`,
    [
      updatedValues.enabled,
      updatedValues.rollout_percentage,
      targetsEnvelope(updatedValues.target_users, updatedValues.target_countries),
      name,
      environment,
    ]
  );

  const updated = normalizeTargets(result.rows[0]);

  await deleteFeatureFromCache(name, environment);
  await setFeatureInCache(updated, name, environment);

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
  return result.rows.map((row) => normalizeTargets(row));
};

const getAuditLogs = async ({ limit = 50, offset = 0 } = {}) => {
  const lim = Math.min(500, Math.max(1, Number(limit) || 50));
  const off = Math.max(0, Number(offset) || 0);

  const countResult = await db.query(
    `SELECT COUNT(*)::int AS total FROM audit_logs`
  );
  const total = countResult.rows[0].total;

  const result = await db.query(
    `SELECT * FROM audit_logs ORDER BY changed_at DESC LIMIT $1 OFFSET $2`,
    [lim, off]
  );

  return {
    data: result.rows,
    total,
    limit: lim,
    offset: off,
  };
};

module.exports = {
  createFeature,
  getFeature,
  updateFeature,
  getAllFeatures,
  getAuditLogs,
};

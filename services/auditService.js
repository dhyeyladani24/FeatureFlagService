const db = require("../config/db");

/** Plain JSON text for JSONB columns (avoids pg array vs JSON ambiguity on nested values). */
const asJsonbParam = (value) => {
  if (value === null || value === undefined) {
    return null;
  }
  return JSON.stringify(JSON.parse(JSON.stringify(value)));
};

const logAudit = async ({
  featureName,
  environment,
  action,
  oldValue,
  newValue,
}) => {
  await db.query(
    `INSERT INTO audit_logs (feature_name, environment, action, old_value, new_value)
     VALUES ($1, $2, $3, $4::jsonb, $5::jsonb)`,
    [
      featureName,
      environment,
      action,
      oldValue == null ? null : asJsonbParam(oldValue),
      newValue == null ? null : asJsonbParam(newValue),
    ]
  );
};

module.exports = {
  logAudit,
};

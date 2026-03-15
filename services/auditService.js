const db = require("../config/db");

const logAudit = async ({
  featureName,
  environment,
  action,
  oldValue,
  newValue,
}) => {
  await db.query(
    `INSERT INTO audit_logs (feature_name, environment, action, old_value, new_value)
     VALUES ($1, $2, $3, $4, $5)`,
    [featureName, environment, action, oldValue, newValue]
  );
};

module.exports = {
  logAudit,
};
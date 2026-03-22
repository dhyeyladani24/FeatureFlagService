const express = require("express");
const router = express.Router();
const featureController = require("../controllers/featureController");
const {
  validateBody,
  validateQuery,
  validateParams,
} = require("../middleware/validate");
const {
  createFeatureBody,
  updateFeatureBody,
  featureKeyParams,
  auditLogsQuery,
  listFeaturesQuery,
} = require("../validators/schemas");

router.get("/test/ping", (req, res) => {
  res.json({ message: "feature routes working" });
});

router.post("/", validateBody(createFeatureBody), featureController.createFeature);

router.get(
  "/",
  validateQuery(listFeaturesQuery),
  featureController.getAllFeatures
);

router.get(
  "/audit/logs",
  validateQuery(auditLogsQuery),
  featureController.getAuditLogs
);

router.get(
  "/:environment/:name",
  validateParams(featureKeyParams),
  featureController.getFeature
);

router.put(
  "/:environment/:name",
  validateParams(featureKeyParams),
  validateBody(updateFeatureBody),
  featureController.updateFeature
);

module.exports = router;

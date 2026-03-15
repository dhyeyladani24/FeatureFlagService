const express = require("express");
const router = express.Router();
const featureController = require("../controllers/featureController");

router.get("/test/ping", (req, res) => {
  res.json({ message: "feature routes working" });
});

router.post("/", featureController.createFeature);
router.get("/", featureController.getAllFeatures);
router.get("/audit/logs", featureController.getAuditLogs);
router.get("/:environment/:name", featureController.getFeature);
router.put("/:environment/:name", featureController.updateFeature);

module.exports = router;
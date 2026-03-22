const express = require("express");
const router = express.Router();
const { getMetrics } = require("../services/metricsService");

router.get("/", (req, res) => {
  res.json(getMetrics());
});

<<<<<<< HEAD
module.exports = router; 
=======
module.exports = router;
>>>>>>> 92cab40 (Improvised Code Structure)

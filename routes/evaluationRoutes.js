const express = require("express");
const router = express.Router();
const evaluateController = require("../controllers/evaluationController");

router.post("/", evaluateController.evaluate);

module.exports = router;
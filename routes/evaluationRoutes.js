const express = require("express");
const router = express.Router();
const evaluateController = require("../controllers/evaluationController");
const { validateBody } = require("../middleware/validate");
const { evaluateBody } = require("../validators/schemas");

router.post("/", validateBody(evaluateBody), evaluateController.evaluate);

module.exports = router;

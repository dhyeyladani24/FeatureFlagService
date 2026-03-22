const { evaluateFeature } = require("../services/evaluationService");

exports.evaluate = async (req, res, next) => {
  try {
    const result = await evaluateFeature(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
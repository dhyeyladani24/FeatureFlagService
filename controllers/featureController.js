const featureService = require("../services/featureService");

exports.createFeature = async (req, res, next) => {
  try {
    const createdFeature = await featureService.createFeature(req.body);
    res.status(201).json(createdFeature);
  } catch (error) {
    next(error);
  }
};

exports.getFeature = async (req, res, next) => {
  try {
    const { environment, name } = req.params;

    const result = await featureService.getFeature(name, environment);

    if (!result) {
      return res.status(404).json({ message: "Feature not found" });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.updateFeature = async (req, res, next) => {
  try {
    const { environment, name } = req.params;

    const updatedFeature = await featureService.updateFeature(
      name,
      environment,
      req.body
    );

    if (!updatedFeature) {
      return res.status(404).json({ message: "Feature not found" });
    }

    res.status(200).json(updatedFeature);
  } catch (error) {
    next(error);
  }
};

exports.getAllFeatures = async (req, res, next) => {
  try {
    const { environment } = req.query;

    const features = await featureService.getAllFeatures(environment ?? undefined);
    res.status(200).json(features);
  } catch (error) {
    next(error);
  }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    const logs = await featureService.getAuditLogs({ limit, offset });
    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};
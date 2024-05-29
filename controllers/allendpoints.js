const endpoints = require("../endpoints.json");
exports.endpointsJson = (req, res) => {
  res.status(200).send(endpoints);
};

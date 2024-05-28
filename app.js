const express = require("express");
const { getTopics } = require("./controllers/topics.js");
const endpoints = require("./endpoints.json");
const app = express();

app.get("/api", (req, res) => {
  res.status(200).send(endpoints);
});

app.get("/api/topics", getTopics);

app.all("/*", (req, res, next) => {
  res.status(404).send({ message: "Not found" });
});

module.exports = app;

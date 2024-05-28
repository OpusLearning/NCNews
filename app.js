const express = require("express");
const { getTopics } = require("./controllers/topics.js");
const { getArticleById } = require("./controllers/articles.js");
const { endpointsJson } = require("./controllers/allendpoints.js");
const endpoints = require("./endpoints.json");
const app = express();

app.get("/api", endpointsJson);
app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticleById);

app.all("/*", (req, res, next) => {
  res.status(404).send({ message: "Not found" });
});

module.exports = app;

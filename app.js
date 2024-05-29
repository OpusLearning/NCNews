const express = require("express");
const { getTopics } = require("./controllers/topics.js");
const {
  getArticleById,
  getArticles,
  getCommentsById,
} = require("./controllers/articles.js");
const { endpointsJson } = require("./controllers/allendpoints.js");
const endpoints = require("./endpoints.json");
const app = express();

app.get("/api", endpointsJson);
app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles/:article_id/comments", getCommentsById);
app.get("/api/articles", getArticles);

app.all("/*", (req, res) => {
  res.status(404).send({ message: "Not found" });
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad request" });
  } else {
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

module.exports = app;

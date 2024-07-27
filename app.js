const express = require("express");
const cors = require("cors");
const { getTopics, postTopic } = require("./controllers/topics.js");
const { selectTopics } = require("./models/topics");
const {
  getArticleById,
  getArticles,
  updateArticleById,
  postArticle,
} = require("./controllers/articles.js");
const {
  getCommentsById,
  addComment,
  deleteByCommentId,
} = require("./controllers/comments.js");
const { getUsers } = require("./controllers/users.js");
const { endpointsJson } = require("./controllers/allendpoints.js");
const endpoints = require("./endpoints.json");

const app = express();

app.use(cors());
app.use(express.json());

// Lightweight ping endpoint
app.get("/api/ping", (req, res) => {
  console.log('Ping received at', new Date().toISOString());
  res.status(200).json({ 
    message: 'pong', 
    timestamp: new Date().toISOString()
  });
});

// Database ping endpoint
app.get("/api/dbping", async (req, res) => {
  try {
    const topics = await selectTopics();
    console.log('DB Ping received at', new Date().toISOString());
    res.status(200).json({ 
      message: 'OK', 
      timestamp: new Date().toISOString(),
      dbStatus: 'Connected',
      topicsCount: topics.length
    });
  } catch (error) {
    console.error('Database ping failed:', error);
    res.status(500).json({ 
      message: 'Error', 
      timestamp: new Date().toISOString(),
      dbStatus: 'Disconnected'
    });
  }
});

app.get("/api", endpointsJson);
app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles/:article_id/comments", getCommentsById);
app.post("/api/articles/:article_id/comments", addComment);
app.get("/api/articles", getArticles);
app.post("/api/articles", postArticle);
app.post("/api/topics", postTopic);
app.patch("/api/articles/:article_id", updateArticleById);
app.delete("/api/comments/:comment_id", deleteByCommentId);
app.get("/api/users", getUsers);

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

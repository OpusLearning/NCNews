const db = require("../db/connection");

exports.selectArticleById = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then((result) => {
      return result.rows[0];
    });
};

exports.selectArticles = (sortBy = "created_at") => {
  return db
    .query(
      `
        SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id)::INT AS comment_count
        FROM articles
        LEFT JOIN comments ON articles.article_id = comments.article_id
        GROUP BY articles.article_id
        ORDER BY ${sortBy} DESC;
        `
    )
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      throw err;
    });
};

exports.selectArticleById = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then((result) => {
      return result.rows[0];
    });
};

exports.selectCommentsById = (article_id) => {
  return db
    .query(
      `SELECT comment_id, votes, created_at, author, body, article_id 
           FROM comments 
           WHERE article_id = $1 
           ORDER BY created_at DESC`,
      [article_id]
    )
    .then((result) => {
      return result.rows;
    })
    .catch((err) => {
      console.error("Error in selectCommentsById:", err);
      throw err;
    });
};

exports.checkArticleExists = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then((result) => {
      if (result.rows.length === 0) {
        const err = new Error("Article not found");
        err.status = 404;
        err.msg = "Article not found";
        throw err;
      }
      return true;
    });
};

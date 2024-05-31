const db = require("../db/connection");

exports.selectArticleById = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1;", [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return rows[0];
    });
};
exports.selectArticles = (sort_by = "created_at", topic) => {
  let queryStr = `
      SELECT 
        author, 
        title, 
        article_id, 
        topic, 
        created_at, 
        votes, 
        article_img_url, 
        CAST((SELECT COUNT(*) FROM comments WHERE comments.article_id = articles.article_id) AS INTEGER) AS comment_count 
      FROM articles`;
  const queryParams = [];

  if (topic) {
    queryStr += " WHERE topic = $1";
    queryParams.push(topic);
  }

  queryStr += ` ORDER BY ${sort_by} DESC;`;

  return db.query(queryStr, queryParams).then(({ rows }) => {
    return rows;
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
    .then((result) => result.rows)
    .catch((err) => {
      return Promise.reject({ status: 500, msg: "Internal Server Error" });
    });
};

exports.updateArticle = (article_id, inc_votes) => {
  return db
    .query(
      `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;`,
      [inc_votes, article_id]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return result.rows[0];
    })
    .catch((err) => {
      return Promise.reject({ status: 500, msg: "Internal Server Error" });
    });
};

const db = require("../db/connection");

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
      throw err;
    });
};

exports.insertComment = (article_id, username, body) => {
  return db
    .query(
      `INSERT INTO comments (article_id, author, body, votes, created_at)
       VALUES ($1, $2, $3, 0, NOW())
       RETURNING *;`,
      [article_id, username, body]
    )
    .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
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

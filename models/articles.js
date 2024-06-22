const db = require("../db/connection");

exports.selectArticleById = (article_id) => {
  return db
    .query(
      `SELECT 
           articles.*, 
           CAST((SELECT COUNT(*) FROM comments WHERE comments.article_id = articles.article_id) AS INTEGER) AS comment_count 
         FROM articles 
         WHERE article_id = $1;`,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return rows[0];
    });
};

exports.selectArticles = (sort_by = "created_at", order = "desc", topic) => {
  const validSortBys = ["created_at", "votes", "comment_count"];
  const validOrders = ["asc", "desc"];

  if (!validSortBys.includes(sort_by) || !validOrders.includes(order)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

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

  queryStr += ` ORDER BY ${sort_by} ${order};`;

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

exports.insertArticle = ({ title, topic, author, body, article_img_url }) => {
  if (!title || !topic || !author || !body) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  const queryStr = `
    INSERT INTO articles (title, topic, author, body, article_img_url, created_at, votes)
    VALUES ($1, $2, $3, $4, $5, NOW(), 0)
    RETURNING *;
  `;
  const queryParams = [title, topic, author, body, article_img_url];

  return db
    .query(queryStr, queryParams)
    .then(({ rows }) => {
      return rows[0];
    })
    .catch((err) => {
      if (err.code === "23503") {
        // Foreign key violation
        return Promise.reject({ status: 400, msg: "Bad request" });
      }
      return Promise.reject({ status: 500, msg: "Internal Server Error" });
    });
};

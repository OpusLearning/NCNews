const db = require("../db/connection");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics").then((result) => {
    return result.rows;
  });
};

exports.insertTopic = ({ slug, description }) => {
  if (!slug || !description) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  const queryStr = `
    INSERT INTO topics (slug, description)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const queryParams = [slug, description];

  return db
    .query(queryStr, queryParams)
    .then(({ rows }) => {
      return rows[0];
    })
    .catch((err) => {
      return Promise.reject({ status: 500, msg: "Internal Server Error" });
    });
};

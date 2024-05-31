const db = require("../db/connection");

exports.fetchUsers = () => {
  return db
    .query("SELECT username, name, avatar_url FROM users;")
    .then(({ rows }) => {
      return rows;
    });
};

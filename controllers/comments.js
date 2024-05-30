const {
  selectCommentsById,
  insertComment,
  checkArticleExists,
} = require("../models/comments");

exports.getCommentsById = (req, res, next) => {
  const { article_id } = req.params;
  const articleIdParsed = parseInt(article_id, 10);

  if (isNaN(articleIdParsed)) {
    return res.status(400).send({ msg: "Bad request" });
  }

  checkArticleExists(articleIdParsed)
    .then(() => {
      return selectCommentsById(articleIdParsed);
    })
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.addComment = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  const articleIdParsed = parseInt(article_id, 10);

  if (isNaN(articleIdParsed)) {
    return res.status(400).send({ msg: "Bad request" });
  }

  if (!username || !body) {
    return res.status(400).send({ msg: "Missing required fields" });
  }

  checkArticleExists(articleIdParsed)
    .then(() => {
      return insertComment(articleIdParsed, username, body);
    })
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

const { selectArticleById, selectArticles } = require("../models/articles");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  const articleIdParsed = parseInt(article_id, 10);

  if (isNaN(articleIdParsed)) {
    return res.status(400).send({ msg: "Bad request" });
  }

  selectArticleById(articleIdParsed)
    .then((article) => {
      if (!article) {
        return res.status(404).send({ msg: "Article not found" });
      }
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticles = (req, res, next) => {
  const { sort_by } = "created_at";
  selectArticles(sort_by)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch((err) => {
      if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
      } else {
        next(err);
      }
    });
};

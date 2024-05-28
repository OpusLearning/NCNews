const { selectArticleById } = require("../models/articles");

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

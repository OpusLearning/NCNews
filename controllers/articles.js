const {
  selectArticleById,
  selectArticles,
  selectCommentsById,
  updateArticle,
} = require("../models/articles");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;

  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  const { sort_by = "created_at", order = "desc", topic } = req.query;
  const validSortBys = ["created_at", "votes", "comment_count"];
  const validOrders = ["asc", "desc"];

  if (!validSortBys.includes(sort_by) || !validOrders.includes(order)) {
    return next({ status: 400, msg: "Bad request" });
  }

  selectArticles(sort_by, order, topic)
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.getCommentsById = async (req, res, next) => {
  const { article_id } = req.params;
  try {
    await selectArticleById(article_id);
    const comments = await selectCommentsById(article_id);
    res.status(200).send({ comments });
  } catch (err) {
    next(err);
  }
};

exports.updateArticleById = async (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  if (typeof inc_votes !== "number") {
    return next({ status: 400, msg: "Bad request" });
  }

  try {
    await selectArticleById(article_id);
    const article = await updateArticle(article_id, inc_votes);
    res.status(200).send({ article });
  } catch (err) {
    next(err.status ? err : { status: 500, msg: "Internal Server Error" });
  }
};

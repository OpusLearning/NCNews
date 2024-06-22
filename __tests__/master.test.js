const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");
const endpoints = require("../endpoints.json");
require("jest-sorted");

beforeEach(() => seed(testData));
afterAll(() => db.end());
//
describe("GET /api/topics Error checking", () => {
  test('404: Responds with "Not Found" for an invalid endpoint', () => {
    return request(app)
      .get("/api/i-am-very-wrong")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Not found");
      });
  });
});

describe("GET /api/topics", () => {
  test("200: responds with an array of topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        expect(body.topics).toBeInstanceOf(Array);
        expect(body.topics.length).toBeGreaterThan(0);

        body.topics.forEach((topic) => {
          expect(topic).toEqual(
            expect.objectContaining({
              slug: expect.any(String),
              description: expect.any(String),
            })
          );
        });
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: responds with comment", () => {
    const newComment = {
      username: "butter_bridge",
      body: "A nice comment.",
    };

    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            article_id: 1,
            author: "butter_bridge",
            body: "A nice comment.",
            votes: 0,
            created_at: expect.any(String),
          })
        );
      });
  });

  test("201: ignores extra properties", () => {
    const newComment = {
      username: "butter_bridge",
      body: "A nice comment.",
      extra_property: "ignore this",
    };

    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.comment).toEqual(
          expect.objectContaining({
            comment_id: expect.any(Number),
            article_id: 1,
            author: "butter_bridge",
            body: "A nice comment.",
            votes: 0,
            created_at: expect.any(String),
          })
        );
        expect(body.comment).not.toHaveProperty("extra_property");
      });
  });

  test("400: missing required fields", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({})
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Missing required fields");
      });
  });

  test("404: article does not exist", () => {
    return request(app)
      .post("/api/articles/9999/comments")
      .send({ username: "butter_bridge", body: "This is a new comment." })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });

  test("404: user does not exist", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({ username: "non_existent_user", body: "This is a new comment." })
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("User not found");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: deletes the given comment by comment_id and responds with no content", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });

  test("404: responds with an error for no comment_id", () => {
    return request(app)
      .delete("/api/comments/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Comment not found");
      });
  });

  test("400: responds with an error for invalid comment_id", () => {
    return request(app)
      .delete("/api/comments/not-a-valid-id")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("/api/articles/:article_id", () => {
  test("200: responds with an article object with the correct properties", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toBeInstanceOf(Object);
        expect(body.article).toEqual(
          expect.objectContaining({
            author: expect.any(String),
            title: expect.any(String),
            article_id: 1,
            body: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
          })
        );
      });
  });

  test("404: responds with an error for a non-existent article_id", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });

  test("400: responds with an error for an invalid article_id", () => {
    return request(app)
      .get("/api/articles/i-am-a-string-and-not-a-number")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("GET /api/articles", () => {
  test("200: responds with an array of articles", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeInstanceOf(Array);
        expect(body.articles.length).toBeGreaterThan(0);
        body.articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number),
            })
          );
          expect(article).not.toHaveProperty("body");
        });
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });
});

describe("404 Test block", () => {
  test("404: responds with an error endpoint does not exist", () => {
    return request(app)
      .get("/api/not-an-endpoint")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Not found");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: responds with an array of comments for article_id, sorted", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments).toBeInstanceOf(Array);
        expect(body.comments.length).toBeGreaterThan(0);
        body.comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: 1,
            })
          );
        });
        expect(body.comments).toBeSortedBy("created_at", { descending: true });
      });
  });

  test('400: responds with "Bad request" for invalid article_id', () => {
    return request(app)
      .get("/api/articles/not-an-id/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });

  test('404: responds with "Article not found" for non-existent article_id', () => {
    return request(app)
      .get("/api/articles/999999/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("200: responds with the updated article", () => {
    const newVotes = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/1")
      .send(newVotes)
      .expect(200)
      .then(({ body }) => {
        expect(body.article).toEqual(
          expect.objectContaining({
            votes: 101, // adding 1 too 100
          })
        );
      });
  });

  test('400: responds with "Bad request" for invalid article_id', () => {
    return request(app)
      .patch("/api/articles/not-an-id")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });

  test("404: responds with an error for non-existent article_id", () => {
    const newVotes = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/9999")
      .send(newVotes)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });

  test("400: responds with an error for invalid inc_votes", () => {
    const invalidVotes = { inc_votes: "not-a-number" };
    return request(app)
      .patch("/api/articles/1")
      .send(invalidVotes)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });

  test("400: responds with an error when inc_votes is missing", () => {
    const invalidVotes = {};
    return request(app)
      .patch("/api/articles/1")
      .send(invalidVotes)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("GET /api", () => {
  test("200: reponds with a JSON object describing all endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(endpoints);
      });
  });
});

describe("GET /api/articles", () => {
  test("200: responds with an array of articles", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeInstanceOf(Array);
        expect(body.articles.length).toBeGreaterThan(0);
        body.articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number),
            })
          );
          expect(article).not.toHaveProperty("body");
        });
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });

  test.skip("404: responds with an empty array when the topic does not exist", () => {
    return request(app)
      .get("/api/articles?topic=not-a-topic")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Topic not found");
      });
  });

  test("200: responds with articles by the topic value specified in the query, including all properties", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeInstanceOf(Array);
        expect(body.articles.length).toBeGreaterThan(0);
        body.articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: "cats",
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number),
            })
          );
        });
      });
  });
});

describe("/api/articles/:article_id", () => {
  test("200: responds with an article object inc comment_count", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        console.log(body);
        expect(body.article).toBeInstanceOf(Object);
        expect(body.article).toEqual(
          expect.objectContaining({
            author: expect.any(String),
            title: expect.any(String),
            article_id: 1,
            body: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: 11,
          })
        );
      });
  });

  test("404: responds with an error for a non-existent article_id", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });

  describe("comment_count", () => {
    test("200: responds with the correct comment_count when no comments", () => {
      return request(app)
        .get("/api/articles/2")
        .expect(200)
        .then(({ body }) => {
          expect(body.article).toEqual(
            expect.objectContaining({
              comment_count: 0,
            })
          );
        });
    });
  });
});

describe("GET /api/articles", () => {
  test("200: responds with an array of articles sorted by created_at in descending order by default", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeInstanceOf(Array);
        expect(body.articles.length).toBeGreaterThan(0);
        body.articles.forEach((article) => {
          expect(article).toEqual(
            expect.objectContaining({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(Number),
            })
          );
          expect(article).not.toHaveProperty("body");
        });
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });

  test("200: responds with an array of articles sorted by votes in descending order", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&order=desc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("votes", { descending: true });
      });
  });

  test("200: responds with an array of articles sorted by votes in ascending order", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&order=asc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("votes", { descending: false });
      });
  });

  test("200: responds with an array of articles sorted by comment_count in descending order", () => {
    return request(app)
      .get("/api/articles?sort_by=comment_count&order=desc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("comment_count", {
          descending: true,
        });
      });
  });

  test("200: responds with an array of articles sorted by comment_count in ascending order", () => {
    return request(app)
      .get("/api/articles?sort_by=comment_count&order=asc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("comment_count", {
          descending: false,
        });
      });
  });

  test("200: responds with an array of articles sorted by created_at in ascending order", () => {
    return request(app)
      .get("/api/articles?sort_by=created_at&order=asc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", { descending: false });
      });
  });

  test("400: responds with an error when passed an invalid sort_by query", () => {
    return request(app)
      .get("/api/articles?sort_by=invalid_column")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });

  test("400: responds with an error when passed an invalid order query", () => {
    return request(app)
      .get("/api/articles?sort_by=created_at&order=invalid_order")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("GET /api/articles", () => {
  test("200: responds with an array of articles sorted by comment_count in descending order", () => {
    return request(app)
      .get("/api/articles?sort_by=comment_count&order=desc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("comment_count", {
          descending: true,
        });
      });
  });

  test("200: responds with an array of articles sorted by comment_count in ascending order", () => {
    return request(app)
      .get("/api/articles?sort_by=comment_count&order=asc")
      .expect(200)
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("comment_count", {
          descending: false,
        });
      });
  });
});

describe("POST /api/articles", () => {
  test("201: responds with the newly created article", () => {
    const newArticle = {
      title: "New Article",
      topic: "mitch",
      author: "butter_bridge",
      body: "This is a new article body.",
      article_img_url: "https://example.com/image.jpg",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body }) => {
        expect(body.article).toEqual(
          expect.objectContaining({
            article_id: expect.any(Number),
            title: "New Article",
            topic: "mitch",
            author: "butter_bridge",
            body: "This is a new article body.",
            created_at: expect.any(String),
            votes: 0,
            article_img_url: "https://example.com/image.jpg",
          })
        );
      });
  });

  test("400: responds with an error when missing required fields", () => {
    const newArticle = {
      title: "New Article",
      topic: "mitch",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });

  test("400: responds with an error when author does not exist", () => {
    const newArticle = {
      title: "New Article",
      topic: "mitch",
      author: "non_existent_author",
      body: "This is a new article body.",
      article_img_url: "https://example.com/image.jpg",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });

  test("400: responds with an error when topic does not exist", () => {
    const newArticle = {
      title: "New Article",
      topic: "non_existent_topic",
      author: "butter_bridge",
      body: "This is a new article body.",
      article_img_url: "https://example.com/image.jpg",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });

  test("201: ignores extra properties", () => {
    const newArticle = {
      title: "New Article",
      topic: "mitch",
      author: "butter_bridge",
      body: "This is a new article body.",
      article_img_url: "https://example.com/image.jpg",
      extra_property: "ignore this",
    };

    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body }) => {
        expect(body.article).toEqual(
          expect.objectContaining({
            article_id: expect.any(Number),
            title: "New Article",
            topic: "mitch",
            author: "butter_bridge",
            body: "This is a new article body.",
            created_at: expect.any(String),
            votes: 0,
            article_img_url: "https://example.com/image.jpg",
          })
        );
        expect(body.article).not.toHaveProperty("extra_property");
      });
  });
});

describe("POST /api/topics", () => {
  test("201: responds with the newly created topic", () => {
    const newTopic = {
      slug: "new-topic",
      description: "A new topic description.",
    };

    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(201)
      .then(({ body }) => {
        expect(body.topic).toEqual(
          expect.objectContaining({
            slug: "new-topic",
            description: "A new topic description.",
          })
        );
      });
  });

  test("400: responds with an error when missing required fields", () => {
    const newTopic = {
      slug: "new-topic",
    };

    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });

  test("201: ignores extra properties", () => {
    const newTopic = {
      slug: "new-topic",
      description: "A new topic description.",
      extra_property: "ignore this",
    };

    return request(app)
      .post("/api/topics")
      .send(newTopic)
      .expect(201)
      .then(({ body }) => {
        expect(body.topic).toEqual(
          expect.objectContaining({
            slug: "new-topic",
            description: "A new topic description.",
          })
        );
        expect(body.topic).not.toHaveProperty("extra_property");
      });
  });
});

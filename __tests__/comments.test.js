const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");
require("jest-sorted");

beforeEach(() => seed(testData));
afterAll(() => db.end());

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

  test("400: invalid article_id", () => {
    return request(app)
      .post("/api/articles/not-a-number/comments")
      .send({ username: "butter_bridge", body: "A nice comment." })
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
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
});

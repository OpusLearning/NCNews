const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");
require("jest-sorted");

beforeEach(() => seed(testData));
afterAll(() => db.end());

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
            article_id: expect.any(Number),
            body: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
          })
        );
      });
  });

  test("404: gives an error a non-existent article_id", () => {
    return request(app)
      .get("/api/articles/9999")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Article not found");
      });
  });

  test("400: responds with an error when given an invalid article_id", () => {
    return request(app)
      .get("/api/articles/i-am-a-string-and-not-a-number")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad request");
      });
  });
});

describe("GET /api/articles", () => {
  test("200: responds with an array of articles, each having the required properties", () => {
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

  test("404: responds with an error when end point does not exist", () => {
    return request(app)
      .get("/api/not-an-endpoint")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Not found");
      });
  });
});

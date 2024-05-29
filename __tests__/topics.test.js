const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const testData = require("../db/data/test-data/index");

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
    return (
      request(app)
        // Return 200 for correct endpoint
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          // refactored to check for array length and array
          expect(body.topics).toBeInstanceOf(Array);
          expect(body.topics.length).toBeGreaterThan(0);
          // Check the contents of each item sent back from our news DB to be strings
          body.topics.forEach((topic) => {
            expect(topic).toEqual(
              expect.objectContaining({
                slug: expect.any(String),
                description: expect.any(String),
              })
            );
          });
        })
    );
  });
});

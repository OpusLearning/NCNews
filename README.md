#NC News

Welcome to NC News! This project is a RESTful API built using Node.js, Express.js, and PostgreSQL. It serves news articles, topics, users, and comments, and supports CRUD operations.

Hosted Version

##You can find the hosted version of the API here.
https://ncnews-trt9.onrender.com/api/users

#Summary

NC News is a backend project that provides an API for a news website. It includes endpoints to manage articles, comments, topics, and users. The API supports various HTTP methods to create, read, update, and delete resources. It is designed to be easily extensible and can be integrated with a frontend application.

Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.
Prerequisites

    Node.js: Minimum version 14.x.x
    PostgreSQL: Minimum version 12.x.x

#Installation

    Clone the repository:

    bash

git clone https://github.com/your-github-username/nc-news.git
cd nc-news

Install dependencies:

bash

npm install

Set up your environment variables:

    Create two .env files in the root directory: .env.test and .env.development.

    Add the following environment variables to each file:

    .env.test:

    makefile

PGDATABASE=nc_news_test

.env.development:

makefile

    PGDATABASE=nc_news

Set up the local database:

    Ensure PostgreSQL is running.
    Create the databases:

    bash

    psql -U your-username -c "CREATE DATABASE nc_news;"
    psql -U your-username -c "CREATE DATABASE nc_news_test;"

Seed the local database:

bash

npm run seed

Run the tests:

bash

    npm test

API Endpoints

The API provides the following endpoints:

    GET /api/topics: Retrieve all topics.
    GET /api : all endpoints
    GET /api/articles: Retrieve all articles or filter by query parameters.
    GET /api/articles/
    : Retrieve a specific article by ID.
    GET /api/articles/:article_id/comments
    PATCH /api/articles/:article_id
    : Update an article's vote count.
    DELETE /api/comments/:comment_id    Delete a comment
    GET /api/articles/
    /comments: Retrieve comments for a specific article.
    POST /api/articles/:article_id/comment
    /comments: Add a comment to an article.
    GET /api/users: Retrieve all users.


    Node.js: v14.x.x or higher
    PostgreSQL: v12.x.x or higher

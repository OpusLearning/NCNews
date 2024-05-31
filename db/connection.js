const { Pool } = require("pg");
const path = require("path");
const ENV = process.env.NODE_ENV || "development";

require("dotenv").config({
  path: path.resolve(__dirname, `../.env.${ENV}`),
});

console.log("NODE_ENV:", ENV);
console.log("Env file path:", path.resolve(__dirname, `../.env.${ENV}`));
console.log("DATABASE_URL:", process.env.DATABASE_URL);

const config = {};

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error("PGDATABASE or DATABASE_URL not set");
}

if (ENV === "production") {
  config.connectionString = process.env.DATABASE_URL;
  config.ssl = {
    rejectUnauthorized: false,
  };
  config.max = 2; // Limits the number of connections for a production environment
} else {
  config.database = process.env.PGDATABASE;
}

module.exports = new Pool(config);

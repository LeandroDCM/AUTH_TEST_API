import express from "express";
import mongoose from "mongoose";
import { routes } from "./routes";
import "dotenv/config";

const app = express();

// config json response
app.use(express.json());
// use routes.ts file for routes
app.use(routes);

// Credentials
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;
const port = 3000;

mongoose
  .connect(``)

  .then(() => {
    app.listen(port);
    console.log("Connected to database");
    console.log("Server is running: " + port + "port");
  })
  .catch((err) => console.log(err));

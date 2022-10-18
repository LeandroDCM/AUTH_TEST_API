require("dotenv").config();
import express from "express";
import mongoose from "mongoose";
import { routes } from "./routes";

const app = express();

// config json response
app.use(express.json());
// use routes.ts file for routes
app.use(routes);

// Credentials
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPassword}@authjwt.t9n0bba.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(3000);
    console.log("Connected to database");
  })
  .catch((err) => console.log(err));

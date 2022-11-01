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
const serverLink = process.env.MONGO_SERVER as string;
const port = process.env.SERVER_PORT;
mongoose
  .connect(serverLink)
  .then(() => {
    app.listen(port);
    console.log("Connected to database");
    console.log("Server is running: " + port + " port");
  })
  .catch((err) => console.log(err));

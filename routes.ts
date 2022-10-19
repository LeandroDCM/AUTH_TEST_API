const { checkToken } = require("./middleware/checkToken");
const express = require("express");
const routes = express.Router();

//Controllers
import UserController from "./controllers/UserController";
import PostController from "./controllers/PostController";
import EmailController from "./controllers/EmailController";
// Open Route - Public Route
routes.get("/", (req: any, res: any) => {
  res.status(200).json({ msg: "Welcome" });
});

// Register User Route
routes.post("/auth/register", UserController.register);

// Login User Route
routes.post("/auth/login", UserController.login);

// Recover User Route
routes.put("/auth/recover", EmailController.recover);

// Reset Password
routes.patch("/auth/reset/:token", UserController.reset);

//Private Route
//function checkToken to check if token is authorized to access private route
routes.get("/user/:id", checkToken, UserController.userIndex);

// Make/update/delete post route
routes.get("/posts/", checkToken, PostController.index);
routes.get("/posts/:id", checkToken, PostController.userPosts);
routes.post("/user/post", checkToken, PostController.post);
routes.patch("/user/:id/post/:postid", checkToken, PostController.update);
routes.delete("/user/:id/post/:postid", checkToken, PostController.delete);

export { routes };

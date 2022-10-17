const { checkToken } = require("./middleware/checkToken");
const express = require("express");
const routes = express.Router();

//Controllers
const UserController = require("./controllers/UserController");
const PostController = require("./controllers/PostController");
const EmailController = require("./controllers/EmailController");
// Open Route - Public Route
routes.get("/", (req: any, res: any) => {
  res.status(200).json({ msg: "Welcome" });
});

// Register User Route
routes.post("/auth/register", UserController.register);

// Login User Route
routes.post("/auth/login", UserController.login);

// Recover User Route
routes.post("/auth/recover", EmailController.recover);

//Private Route
//function checkToken to check if token is authorized to access private route
routes.get("/user/:id", checkToken, UserController.userIndex);

// Make/update/delete post route
routes.get("/posts/", checkToken, PostController.index);
routes.get("/posts/:id", checkToken, PostController.userPosts);
routes.post("/user/:id/post", checkToken, PostController.post);
routes.patch("/user/:id/post/:postid", checkToken, PostController.update);
routes.delete("/user/:id/post/:postid", checkToken, PostController.delete);

export { routes };

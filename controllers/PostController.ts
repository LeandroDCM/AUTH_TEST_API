const { Post } = require("../models/Post");
const { User } = require("../models/User");
const mongoose = require("mongoose");

class PostController {
  async post(req: any, res: any) {
    const { post } = req.body;

    //gets email from checkToken (req.session)
    const email = req.session;

    const [user] = await User.find({ email }, "-password");
    if (!user) {
      return res.json({
        msg: "User not found",
      });
    }

    const newPost = new Post({
      name: user.name,
      user: user.id,
      post,
    });
    await newPost.save();
    return res.json(newPost.post);
  }

  async update(req: any, res: any) {
    const postid = req.params.postid;
    const id = req.params.id;
    const newPost = req.body;

    //check for valid user id
    const isValidUserId = mongoose.Types.ObjectId.isValid(id);
    if (!isValidUserId)
      return res.status(400).json({
        msg: "Post id is not valid",
      });

    //check for valid post id
    const isValidId = mongoose.Types.ObjectId.isValid(postid);
    if (!isValidId)
      return res.status(400).json({
        msg: "Post id is not valid",
      });

    //find user and post
    const user = await User.findById(id, "-password");
    const post = await Post.findById(postid);

    //check if user exists
    if (user === null)
      return res.status(400).json({
        msg: "User id does not exists",
      });

    //check if post exists
    if (post === null)
      return res.status(400).json({
        msg: "Post id does not exists",
      });

    const userId = user._id;
    const postUser = post.user;

    if (!user) {
      return res.json({
        msg: "User not found.",
      });
    }

    if (!post) {
      return res.json({
        msg: "Post not found.",
      });
    }

    //checks if user is updating own post or someone elses
    if (userId.toString() === postUser.toString()) {
      await Post.findByIdAndUpdate(postid, newPost);
      return res.json(newPost);
    } else {
      return res.json({ Error: "Cannot update another users post." });
    }
  }

  async delete(req: any, res: any) {
    try {
      const postid = req.params.postid;
      const userid = req.params.id;

      const thisPost = await Post.findById(postid);
      if (userid.toString() !== thisPost.user.toString()) {
        return res.send("Access denied. Cannot delete other users post.");
      }

      const post = await Post.findByIdAndDelete(postid);

      if (!post) res.status(404).send("No post found");
      res.status(200).send("Post deleted successfully");
    } catch (error) {
      res.status(500).send(error);
    }
  }

  async index(req: any, res: any) {
    try {
      const posts = await Post.find({}, "name post -_id");
      res.json(posts);
    } catch (error) {
      res.status(500).send(error);
    }
  }

  async userPosts(req: any, res: any) {
    try {
      const id = req.params.id;

      const posts = await Post.find({ user: id.toString() }, "name post -_id");
      res.json(posts);
    } catch (error) {
      res.status(500).send(error);
    }
  }
}

export default new PostController();

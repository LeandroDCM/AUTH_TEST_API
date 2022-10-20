const { Post } = require("../models/Post");
const { User } = require("../models/User");
const mongoose = require("mongoose");
import idIsValid from "../utils/postIdValidator";

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
    const email = req.session;
    const newPost = req.body;

    //check for valid post id and prevents crash
    const isValid = idIsValid(postid);
    if (isValid) {
      return res.status(422).json({ msg: isValid });
    }

    //find user and post
    const [user] = await User.find({ email }, "-password");
    const post = await Post.findById(postid);

    //check if user exists
    if (!user)
      return res.status(400).json({
        msg: "User not found",
      });

    //check if post is empty/exists
    if (post === null || !post)
      return res.status(400).json({
        msg: "Empty post id or non existent.",
      });

    //checks if user is updating own post or someone elses
    if (user._id.toString() === post.user.toString()) {
      await Post.findByIdAndUpdate(postid, newPost);
      return res.json(newPost);
    } else {
      return res.json({ Error: "Cannot update another users post." });
    }
  }

  async delete(req: any, res: any) {
    try {
      const postid = req.params.postid;
      const email = req.session;

      //check for valid post id and prevents crash
      const isValid = idIsValid(postid);
      if (isValid) {
        return res.status(422).json({ msg: isValid });
      }

      //finds user and post
      const [user] = await User.find({ email }, "-password");
      const thisPost = await Post.findById(postid);

      //check if post exists and prevents crash from null
      if (!thisPost || thisPost === null)
        res.status(404).json({
          msg: "No post found",
        });

      //check if user is changing own post or someone elses
      if (user._id.toString() !== thisPost.user.toString()) {
        return res.json({
          msg: "Access denied. Cannot delete other users post.",
        });
      }

      //delete post if tests are passed
      await Post.findByIdAndDelete(postid);
      res.status(200).json({
        msg: "Post deleted successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Error",
      });
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

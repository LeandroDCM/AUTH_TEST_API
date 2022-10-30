const { Post } = require("../models/Post"); //error if import from
const { User } = require("../models/User");
import idIsValid from "../utils/postIdValidator";
import { Request, Response } from "express";
import { UserInterface } from "../models/User";
import { PostInterface } from "../models/Post";

class PostController {
  async post(req: Request, res: Response) {
    const { post } = req.body as { post: string };

    //gets email from checkToken (req.session)
    const userInformation = req.session;

    const [user] = (await User.find(
      { username: userInformation.username },
      "-password"
    )) as [{ name: string; id: string; username: string }];

    if (!user) {
      return res.json({
        msg: "User not found",
      });
    }

    const newPost = new Post({
      name: user.name,
      user: user.id,
      post,
    }) as PostInterface;

    await newPost.save();
    return res.json(newPost.post);
  }

  async update(req: Request, res: Response) {
    const postid = req.params.postid;
    const userInformation = req.session;
    const newPost = req.body as { newPost: string };

    //check for valid post id and prevents crash
    const isValid = idIsValid(postid);
    if (isValid) {
      return res.status(422).json({ msg: isValid });
    }

    //find user and post
    const [user] = (await User.find(
      {
        username: userInformation.username,
      },
      "-password"
    )) as [{ name: string; id: string; username: string; _id: string }];
    const post = (await Post.findById(postid)) as PostInterface;

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

  async delete(req: Request, res: Response) {
    try {
      const postid = req.params.postid;
      const userInformation = req.session;

      //check for valid post id and prevents crash
      const isValid = idIsValid(postid);
      if (isValid) {
        return res.status(422).json({ msg: isValid });
      }

      //finds user and post
      const [user] = (await User.find(
        { username: userInformation.username },
        "-password"
      )) as [{ name: string; id: string; username: string; _id: string }];
      const thisPost = (await Post.findById(postid)) as PostInterface;

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
      const deletePost = await Post.findByIdAndDelete(postid);
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

  async index(req: Request, res: Response) {
    try {
      const posts = (await Post.find({}, "name post -_id")) as PostInterface;
      res.json(posts);
    } catch (error) {
      res.status(500).send(error);
    }
  }

  async userPosts(req: Request, res: Response) {
    try {
      const id = req.params.id;

      const testId = idIsValid(id);
      if (testId) {
        return testId;
      }
      const posts = (await Post.find(
        { user: id.toString() },
        "name post -_id"
      )) as PostInterface;

      if (!posts || posts.length === 0) {
        return res.json({
          msg: "Post not found or wrong user id.",
        });
      }

      res.json(posts);
    } catch (error) {
      res.status(500).json({
        msg: "Error with user id",
      });
    }
  }
}

export default new PostController();

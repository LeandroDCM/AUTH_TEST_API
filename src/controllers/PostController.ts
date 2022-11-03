import { IUser } from "./../interface/IUser";
import { Post } from "../models/Post";
import { User } from "../models/User";
import idIsValid from "../utils/postIdValidator";
import { Request, Response } from "express";
import USER_ROLES from "../utils/USER_ROLES";
import { IPost } from "../interface/IPost";

class PostController {
  async makePost(req: Request, res: Response) {
    const { post } = req.body as { post: string };

    if (!post) {
      return res.json({
        msg: "Post can't be empty",
      });
    }

    //gets email from checkToken (req.session)
    const userInformation = req.session;

    const user = (await User.findOne(
      { username: userInformation.username },
      "-password"
    )) as IUser;

    if (!user) {
      return res.json({
        msg: "User not found",
      });
    }

    try {
      //if the user is admin or moderator he can post without being activated
      if (user.is_activated || user.role_id > USER_ROLES.USER) {
        const newPost = new Post({
          name: user.name,
          user: user.id,
          post,
        }) as IPost;

        await newPost.save();
        return res.json(newPost.post);
      } else {
        return res.json({
          msg: "Account not activated, please check your email.",
        });
      }
    } catch (error) {
      console.log(error);
      return res.json({
        msg: "Account not activated, please check your email.",
      });
    }
  }

  async updatePost(req: Request, res: Response) {
    const postid = req.params.postid as string;
    const userInformation = req.session;
    const newPost = req.body as { newPost: string };

    //check for valid post id and prevents crash
    const isValid = idIsValid(postid);
    if (isValid) {
      return res.status(422).json({ msg: isValid });
    }

    //find user and post
    const user = (await User.findOne(
      {
        username: userInformation.username,
      },
      "-password"
    )) as IUser;

    const post = (await Post.findById(postid)) as IPost;

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

  async deletePost(req: Request, res: Response) {
    try {
      const postid = req.params.postid;
      const userInformation = req.session;

      //check for valid post id and prevents crash
      const isValid = idIsValid(postid);
      if (isValid) {
        return res.status(422).json({ msg: isValid });
      }

      //finds user
      const user = (await User.findOne(
        { username: userInformation.username },
        "-password"
      )) as IUser;

      //finds the post
      const thisPost = (await Post.findById(postid)) as IPost;

      //finds the poster
      const thisPostPoster = (await User.findById(
        thisPost.user,
        "-password -name -email"
      )) as IUser;

      //check if post exists and prevents crash from null
      if (!thisPost || thisPost === null)
        res.status(404).json({
          msg: "No post found",
        });

      //if user role_id === 3 "ADMIN" delete anything he wants
      if (user.role_id === USER_ROLES.ADM) {
        //delete post if tests are passed
        await Post.findByIdAndDelete(postid);
        return res.status(200).json({
          msg: "Post deleted successfully",
        });
      }

      //if user role_id === 2 "MODERATOR" delete anything but ADMIN posts
      if (
        user.role_id === USER_ROLES.MOD &&
        thisPostPoster.role_id !== USER_ROLES.ADM
      ) {
        //delete post if tests are passed
        await Post.findByIdAndDelete(postid);
        return res.status(200).json({
          msg: "Post deleted successfully",
        });
      }

      //if user role_id === 1 "USER" and this post was made by the same user
      if (
        user.role_id === USER_ROLES.USER &&
        user._id.toString() === thisPostPoster._id.toString()
      ) {
        //delete post if tests are passed
        await Post.findByIdAndDelete(postid);
        return res.status(200).json({
          msg: "Post deleted successfully",
        });
      }
      //check if user is trying to do something he does not have permission to do
      throw new Error(
        "Access denied. You do not have permission to delete this post"
      );
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Error",
      });
    }
  }

  async index(req: Request, res: Response) {
    try {
      const posts = (await Post.findOne({}, "name post -_id")) as IPost;
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
        { user: id },
        "name post -_id"
      )) as IPost[];

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

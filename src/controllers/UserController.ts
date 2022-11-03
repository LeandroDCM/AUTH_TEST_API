import { UserInterface } from "./../models/User";
import { IUser } from "./../interface/IUser";
//const { User } = require("../models/User"); //error if import from
import { User } from "../models/User";
import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { IUserLogin } from "../interface/IUserLogin";
import { IUserRegister } from "../interface/IUserRegister";
import { IUserReset } from "../interface/IUserReset";
import hasErrors from "../utils/paramsValidator";
import USER_ROLES from "../utils/USER_ROLES";
import validPassword from "../utils/validPassword";
import mailgun from "mailgun-js";
import "dotenv/config";
import idIsValid from "../utils/postIdValidator";

//setting up mailgun
const DOMAIN = process.env.EMAIL_DOMAIN as string;
const mg = mailgun({
  apiKey: process.env.EMAIL_API_KEY as string,
  domain: DOMAIN,
});

class UserController {
  async register(req: Request, res: Response) {
    const { username, name, email, password, confirmPassword } =
      req.body as IUserRegister;

    const requestFields = [
      "username",
      "name",
      "email",
      "password",
      "confirmPassword",
    ];
    const errors = hasErrors(requestFields, req.body);
    if (errors.length === 1) {
      //if one error exist
      return res
        .status(422) //join and return them
        .json({ msg: `Field: ${errors[0]} is required` });
    } else if (errors.length > 1) {
      //if errors exist
      return res
        .status(422) //join and return them
        .json({ msg: `Fields: ${errors.join(",")} are required!` });
    }

    //validations
    const isPasswordInvalid = validPassword(password, confirmPassword);
    if (isPasswordInvalid)
      return res.status(422).json({ msg: isPasswordInvalid });

    //check if user exists
    const userExists = (await User.findOne({
      $or: [{ username: username }, { email: email }],
    })) as IUser;

    if (userExists) {
      return res.status(422).json({ msg: "Email or username already in use!" });
    }

    // create password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    try {
      //makes username a token to compare username at password reset link
      const secret = process.env.SECRET as string;

      const token = jwt.sign({ username: username }, secret);

      //Email data
      const data = {
        from: "noreply@email.com",
        to: `${email}`,
        subject: "Activate Account",
        text: `<a href="${process.env.CLIENT_URL}/auth/activate/${token}">Activation Link</a>`,
        html: `<a href="${process.env.CLIENT_URL}/auth/activate/${token}">Activation Link</a>`,
      };

      //send email
      mg.messages().send(data, function (error, body) {
        console.log(body);
      });

      //create user
      const user = new User({
        username,
        name,
        email,
        password: passwordHash,
      }) as IUser;

      await user.save();

      res.status(201).json({
        msg: "User created successfully, Please confirm your Email to be able to make Posts",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Error ocurred in server, try again later!",
      });
    }
  }

  async login(req: Request, res: Response) {
    // username OR email = login
    const { login, password } = req.body as IUserLogin;

    //validation
    const requestFields = ["login", "password"];
    const errors = hasErrors(requestFields, req.body);
    if (errors.length === 1) {
      return res.status(422).json({
        msg: `Field: ${errors[0]} is required!`,
      });
    } else if (errors.length > 1) {
      return res.status(422).json({
        msg: `Fields: ${errors.join(",")} are required!`,
      });
    }

    //check if user exists
    const user = (await User.findOne({
      $or: [{ username: login }, { email: login }],
    })) as IUser;

    if (!user) {
      return res.status(404).json({ msg: "User not found!" });
    }

    // check if password match
    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return res.status(422).json({ msg: "Invalid password!" });
    }

    try {
      //Generates token with user email
      const secret = process.env.SECRET as string;

      const token = jwt.sign(
        {
          email: user.email,
          username: user.username,
          role_id: user.role_id,
          // change this for email
        },
        secret
      );

      //Simulates sending token through header
      res.status(200).json({ msg: "Successful authentication ", token });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Error ocurred in server, try again later!",
      });
    }
  }

  async userIndex(req: Request, res: Response) {
    try {
      //gets email from checkToken (req.session)
      const userInformation = req.session;
      const user = (await User.findOne(
        { username: userInformation.username },
        "-password -_id -resetLink -email -role_id"
      )) as IUser;

      //check if users exists
      if (!user) {
        res.status(422).json({ User: "not found" });
        return;
      }

      res.status(200).json({ user });
    } catch (error) {
      console.log(error);
      return res.status(404).json({ msg: "User not found!" });
    }
  }

  async resetPassword(req: Request, res: Response) {
    const { username, newPassword, confirmNewPass } = req.body as IUserReset;
    //token came from recovery email
    const { token } = req.params as { token: string };

    //checking password regex
    const isPasswordInvalid = validPassword(newPassword, confirmNewPass);
    if (isPasswordInvalid)
      return res.status(422).json({ msg: isPasswordInvalid });

    if (!newPassword || !confirmNewPass) {
      return res.status(422).json({ msg: "Password is required!" });
    }

    try {
      const secret = process.env.SECRET as string;
      //grab username from token passed through email
      const userInformation = jwt.verify(token, secret) as {
        username: string;
        _id: string;
      };

      //compares username grabbed from inside the email of the user
      //with the username provided by the user in the time of password changing
      if (username !== userInformation.username) {
        return res.json({
          Error: "User not found!",
        });
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      //verify user from the token that he got from email
      await User.findByIdAndUpdate(userInformation._id, {
        password: passwordHash,
      });

      return res.json({
        msg: "New password created successfully",
      });
    } catch (error) {
      console.log(error);
      return res.json({
        msg: "Invalid token",
      });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const userId = req.params.id as string;

      //check for valid user id and prevents crash
      if (idIsValid(userId)) {
        return res.status(500).json({
          msg: "Post id is not valid",
        });
      }

      const userInformation = req.session;
      //find logged user
      const loggedUser = (await User.findOne(
        {
          username: userInformation.username,
        },
        "-password -email"
      )) as IUser;

      //find user to be deleted
      const user = (await User.findById(userId)) as IUser;

      //if loggedUser role_id === 3 "ADMIN" delete anything he wants
      if (loggedUser.role_id === USER_ROLES.ADM) {
        //delete post if tests are passed
        await user.deleteOne({ username: user.username });
        return res.status(200).json({
          msg: "User deleted successfully",
        });
      }
      //handles "Error" without need to throw an Error
      return res
        .status(404)
        .json({ msg: "User not found or no permission to delete" });
    } catch (error) {
      console.log(error);
      return res
        .status(404)
        .json({ msg: "User not found or no permission to delete" });
    }
  }

  async activate(req: Request, res: Response) {
    try {
      const token = req.params.token as string;
      //acts as a fake activate button
      const { activateButton } = req.body as { activateButton: string };

      //decoding jwt token
      const secret = process.env.SECRET as string;
      const userInformation = jwt.verify(token, secret) as { username: string };

      //find user
      const user = (await User.findOne({
        username: userInformation.username,
      })) as IUser;

      //checks if he clicks the fake button
      if (activateButton === "ACTIVATE") {
        await User.findByIdAndUpdate(user._id, {
          is_activated: true,
        });
        return res.json({
          msg: "User account activated!",
        });
      }
      return res.json({
        msg: "Error! Invalid or expired token!",
      });
    } catch (error) {
      console.log(error);
      return res.json({
        msg: "Error! Invalid or expired token!",
      });
    }
  }
}

export default new UserController();

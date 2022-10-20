const { User } = require("../models/User");
const bcrypt = require("bcrypt");
import jwt from "jsonwebtoken";
import hasErrors from "../utils/paramsValidator";
import validPassword from "../utils/validPassword";

class UserController {
  async register(req: any, res: any) {
    const { name, email, password, confirmPassword } = req.body;

    const requestFields = ["name", "email", "password", "confirmPassword"];
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
    const userExists = await User.findOne({
      $or: [{ name: name }, { email: email }],
    });

    if (userExists) {
      return res.status(422).json({ msg: "Email or username already in use!" });
    }

    // create password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    //create user
    const user = new User({
      name,
      email,
      password: passwordHash,
    });

    try {
      await user.save();

      res.status(201).json({
        msg: "User created successfully",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        msg: "Error ocurred in server, try again later!",
      });
    }
  }

  async login(req: any, res: any) {
    // username OR email = login
    const { login, password } = req.body;

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
    const user = await User.findOne({
      $or: [{ name: login }, { email: login }],
    });

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

  async userIndex(req: any, res: any) {
    try {
      //gets email from checkToken (req.session)
      const email = req.session;

      const [user] = await User.find(
        { email },
        "-password -_id -resetLink -email"
      );

      //check if users exists
      if (!user || user === null) {
        res.status(422).json({ User: "not found" });
        return;
      }

      res.status(200).json({ user });
    } catch (error) {
      console.log(error);
      return res.status(404).json({ msg: "User not found!" });
    }
  }

  async reset(req: any, res: any) {
    const { newPassword, confirmNewPass } = req.body;
    //token came from recovery email
    const { token } = req.params;

    //checking password regex
    const isPasswordInvalid = validPassword(newPassword, confirmNewPass);
    if (isPasswordInvalid)
      return res.status(422).json({ msg: isPasswordInvalid });

    if (!newPassword || !confirmNewPass) {
      return res.status(422).json({ msg: "Password is required!" });
    }

    try {
      const secret = process.env.SECRET as string;

      const userId = jwt.verify(token, secret);

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      //verify user from the token that he got from email
      await User.findByIdAndUpdate(userId, {
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
}

export default new UserController();

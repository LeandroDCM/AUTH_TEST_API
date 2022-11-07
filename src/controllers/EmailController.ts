import { IUser } from "./../interface/IUser";
import { User } from "../models/User";
import "dotenv/config";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { mailgunCli } from "../utils/MailgunClient";

class EmailController {
  async recover(req: Request, res: Response) {
    const { email } = req.body as { email: string };

    //check for user
    const user = (await User.findOne({
      email: email,
    })) as IUser;

    //check for user
    if (!user) {
      return res.json({
        msg: "Email not found!",
      });
    }
    //makes username a token to compare username at password reset link
    const secret = process.env.SECRET as string;

    const token = jwt.sign(
      {
        _id: user._id,
        username: user.username,
      },
      secret
    );

    try {
      //send email
      mailgunCli.send(
        "noreply@email.com",
        `${email}`,
        "Password Change",
        `<a href="${process.env.CLIENT_URL}/auth/reset/${token}">Password Change Link</a>`,
        `<a href="${process.env.CLIENT_URL}/auth/reset/${token}">Password Change Link</a>`
      );
      res.json({
        msg: "Email sent with your information!",
      });
      return user.updateOne({ resetLink: token });
    } catch (error) {
      console.log(error);
      res.json({
        msg: "Reset password link error",
      });
    }
  }
}

//fix glitch with requiring User
export default new EmailController();

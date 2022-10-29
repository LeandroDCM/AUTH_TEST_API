const { User } = require("../models/User");
const nodemailer = require("nodemailer"); //error if import from
import "dotenv/config";
import jwt from "jsonwebtoken";
import mailgun from "mailgun-js";
import { Request, Response } from "express";
import { UserInterface } from "../models/User";

//setting up mailgun
const DOMAIN = process.env.EMAIL_DOMAIN as string;
const mg = mailgun({
  apiKey: process.env.EMAIL_API_KEY as string,
  domain: DOMAIN,
});

/* let transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASS,
  },
}); */

class EmailController {
  async recover(req: Request, res: Response) {
    const { email } = req.body as { email: string };

    const user = (await User.findOne({
      email: email,
    })) as UserInterface;

    if (!user) {
      return res.json({
        msg: "Email not found!",
      });
    }

    const secret = process.env.SECRET as string;

    const token = jwt.sign(
      {
        _id: user._id,
        username: user.username,
      },
      secret
    );

    const data = {
      from: "Excited User <me@samples.mailgun.org>",
      to: `${email}`,
      subject: "Password Change",
      text: `<a href="${process.env.CLIENT_URL}/auth/reset/${token}">Password Change Link</a>`,
      html: `<a href="${process.env.CLIENT_URL}/auth/reset/${token}">Password Change</a>`,
    };

    try {
      //send email
      mg.messages().send(data, function (error, body) {
        console.log(body);
      });
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

const { User } = require("../models/User");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
require("dotenv").config();
import jwt from "jsonwebtoken";

let transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASS,
  },
});

class EmailController {
  async recover(req: any, res: any) {
    const { email } = req.body;

    const userExists = await User.findOne({ email: email });

    if (!userExists) {
      return res.json({
        msg: "Email not found!",
      });
    }
    const secret = process.env.SECRET as string;
    const username = userExists.name;

    const token = jwt.sign({ _id: userExists._id }, secret);

    const mailOptions = {
      from: "07c7405dc0-27a88f@inbox.mailtrap.io", // Sender address
      to: email, // List of recipients
      subject: "Account password reset link", // Subject line
      text: `Hello ${username} click this link to reset your password`,
      html: `<a href="http://localhost:3000/auth/reset/${token}">Recovery Link</a>`, // Plain text body
    };

    try {
      transport.sendMail(mailOptions);
      res.json({
        msg: "Email sent with your information!",
      });
      return userExists.updateOne({ resetLink: token });
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

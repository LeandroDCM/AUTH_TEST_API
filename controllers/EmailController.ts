const { User } = require("../models/User");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
require("dotenv").config();

let transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = {
  async recover(req: any, res: any) {
    const { email } = req.body;

    const userExists = await User.findOne({ email: email });

    if (!userExists) {
      return res.json({
        msg: "Email not found!",
      });
    }

    const username = userExists.name;

    const mailOptions = {
      from: "07c7405dc0-27a88f@inbox.mailtrap.io", // Sender address
      to: email.toString(), // List of recipients
      subject: "Username and password recovery.", // Subject line
      text: `Hello ${username} click this link to make a new password`, // Plain text body
    };

    try {
      transport.sendMail(mailOptions);
      res.json({
        msg: "Email sent with your information!",
      });
    } catch (error) {
      console.log(error);
    }
  },
};

//fix glitch with requiring User
export {};

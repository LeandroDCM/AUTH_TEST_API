import jwt from "jsonwebtoken";

function checkToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  //catches the token from the header and makes it the right format

  if (!token) {
    return res.status(401).json({ msg: "Access denied!" });
  }

  try {
    const secret = process.env.SECRET as string;

    //verifies the token and no errors are thrown
    const userInformation = jwt.verify(token, secret) as any;
    //passes the email to req.session to know which user is logged
    req.session = userInformation;

    next();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "Invalid Token" });
  }
}

module.exports = { checkToken };

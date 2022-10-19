import jwt from "jsonwebtoken";

function checkToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Access denied!" });
  }

  try {
    const secret = process.env.SECRET as string;

    const { email } = jwt.verify(token, secret) as any;
    req.session = email;

    next();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: "Invalid Token" });
  }
}

module.exports = { checkToken };

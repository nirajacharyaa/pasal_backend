import jwt from "jsonwebtoken";
const auth = (req, res, next) => {
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  if (!token) {
    return res
      .status(400)
      .json({ success: false, msg: "token required for authentication" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({ success: false, msg: "Invalid token" });
  }
  return next();
};

export default auth;

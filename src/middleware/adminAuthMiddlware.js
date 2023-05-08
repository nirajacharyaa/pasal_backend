const adminAuth = (req, res, next) => {
  if (req.user.isAdmin) {
    return next();
  } else {
    return res.status(402).json({ success: true, msg: "You are not an admin" });
  }
};

export default adminAuth;

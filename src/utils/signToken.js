import jwt from "jsonwebtoken";
const signToken = async (user) => {
  const token = jwt.sign(
    { userId: user.id, email: user.email, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    {
      expiresIn: "1w",
    }
  );
  return token;
};

export default signToken;

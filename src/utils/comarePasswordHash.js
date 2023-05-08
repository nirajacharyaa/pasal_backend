import bcrypt from "bcryptjs";
const compareHashPassword = async (password, hash) => {
  const comparision = bcrypt.compareSync(password, hash);
  return comparision;
};

export default compareHashPassword;

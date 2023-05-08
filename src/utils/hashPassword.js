import bcrypt from "bcryptjs";

const hashPassword = async (password) => {
  try {
    const salt = bcrypt.genSaltSync();
    return bcrypt.hashSync(password, salt);
  } catch (err) {
    console.log(err);
  }
};

export default hashPassword;

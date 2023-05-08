import mongoose from "mongoose";
import "dotenv/config";

const uri = process.env.DB_URL;

const connectToDb = async () => {
  try {
    await mongoose.connect(uri);
    console.log("Succesfully connected to DB");
  } catch (err) {
    console.log(err);
  }
};

export default connectToDb;

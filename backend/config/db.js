import mongoose from "mongoose";
// import dotenv from "dotenv";

// dotenv.config({});
const connectDB = async (req, res) => {
  await mongoose.connect(`${process.env.DB_URI}`).then((response) => {
    console.log(`Database connected to server at ${response.connection.host}`);
  });
};

export { connectDB };

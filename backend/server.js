import { app } from "./app.js";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

dotenv.config({});
connectDB();

process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server");

  server.close(() => {
    process.exit(1);
  });
});

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.PORT}`);
});

//unhandled Promise rejection -> mongodb ki taraf se aaya hua error
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down the server");
  server.close(() => {
    process.exit(1);
  });
});

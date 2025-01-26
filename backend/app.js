import express from "express";
import productRoute from "./routes/product.route.js";
import userRouter from "./routes/user.route.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1", productRoute);
app.use("/api/v1/user", userRouter);
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error!!";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
export { app };

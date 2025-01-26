import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncErrors.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({});

export const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(errorHandler(400, "All fields are compulsory"));
  }

  const existedUser = await User.findOne({ email });
  if (existedUser) {
    return next(errorHandler(400, "User already exist. Please try to login"));
  }

  const hashedPassword = bcryptjs.hashSync(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    avatar: {
      public_id: "I am public_id",
      url: "I am an URL",
    },
  });
  //   res.status(201).json({ newUser, message: "User created Successfully" });

  // automatically login functionality on user registration
  const { hashedPassword: pass, ...rest } = newUser._doc;

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
  res
    .status(200)
    .cookie("access_token", token, { httpOnly: true, secure: true })
    .json({ rest, message: "Registered and Logged In Successfully" });
});

export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const validUser = await User.findOne({ email });
  if (!validUser) {
    return next(errorHandler(404, "Please register first"));
  }

  const matchPassword = bcryptjs.compareSync(password, validUser.password);
  if (!matchPassword) {
    return next(errorHandler(404, "Invalid Credentials"));
  }

  const { password: pass, ...rest } = validUser._doc;
  const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
  res
    .status(200)
    .cookie("access_token", token, { httpOnly: true, secure: true })
    .json({ rest, message: "Logged In Successfully" });
});

export const logoutUser = asyncHandler(async (req, res, next) => {
  res.clearCookie("access_token");
  res.status(200).json({ message: "Logged Out Successfully" });
});

export const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(errorHandler(404, "User does not exist"));
  }

  const newUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.status(200).json({ newUser, message: "User updated Successfully" });
});

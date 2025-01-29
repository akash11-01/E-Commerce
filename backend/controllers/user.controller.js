import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncErrors.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import cloudinary from "cloudinary";

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

export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const ValidUser = await User.findOne({ email });
  if (!ValidUser) {
    return next(404, "Email not found");
  }

  const reseteToken = ValidUser.getResetPasswordToken();
  await ValidUser.save({ validateBeforeSave: false });
  const resetPasswordTUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${reseteToken}`;

  const message = `Your password reset token is -:\n\n ${resetPasswordTUrl} \n if you have not request this email then, Please ignore it.`;

  try {
    await sendEmail({
      email: ValidUser.email,
      subject: `Ecommerce Password recovery`,
      message,
    });
    res
      .status(200)
      .json({ message: `Email sent to ${user.email} successfully` });
  } catch (error) {
    ValidUser.resetPasswordToken = undefined;
    ValidUser.resetPasswordExpire = undefined;
    await ValidUser.save({ validateBeforeSave: false });
    return next(errorHandler(500, error.message));
  }

  const token = jwt.sign({ id: ValidUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
  res.cookie("access_token", token, { httpOnly: true, secure: true });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const ValidUser = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!ValidUser) {
    return next(
      errorHandler(404, "Reset Token is invalid or has been expired")
    );
  }

  if (req.body.newPassword !== req.body.newConfirmPassword) {
    return next(errorHandler(400, "Password not matched"));
  }

  ValidUser.password = req.body.newPassword;
  ValidUser.resetPasswordToken = undefined;
  ValidUser.resetPasswordExpire = undefined;
  await ValidUser.save();

  const token = jwt.sign({ id: ValidUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });

  res.cookie("access_token", token, { httpOnly: true, secure: false });
});

export const getAllUsers = asyncHandler(async (req, res, next) => {
  const ValidUsers = await User.find();
  res.status(200).json({ ValidUsers, message: "All Users" });
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  const { newPassword, oldPassword } = req.body;
  const ValidUser = await User.findById(req.user.id);
  if (!ValidUser) {
    return next(errorHandler(400, "User not authenticated"));
  }

  const isMatchedPassword = bcryptjs.compareSync(
    ValidUser.password,
    oldPassword
  );
  if (!isMatchedPassword) {
    return next(errorHandler(400, "Please write correct password"));
  }

  ValidUser.password = newPassword;
  await ValidUser.save();
  const token = jwt.sign({ id: ValidUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
  req.cookie("access_token", token, { httpOnly: true, secure: false });
});

export const getSingleUser = asyncHandler(async (req, rs, next) => {
  const ValidUser = await User.findById(req.params.id);
  if (!ValidUser) {
    return next(errorHandler(404, "User not found"));
  }
  res.satus(200).json({ ValidUser });
});

export const deleteUser = asyncHandler(async (req, res, next) => {
  const ValidUser = await User.findById(req.params.id);
  if (!ValidUser) {
    return next(errorHandler(404, "User not found"));
  }

  const imageId = ValidUser.avatar.public_id;
  await cloudinary.v2.uploader.destroy(imageId);

  const deletedUser = await User.findByIdAndDelete(req.params.id);

  res.status(200).json({ deleteUser, message: "user successfully deleted" });
});

export const updateProfile = asyncHandler(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  if (req.body.avatar !== "") {
    const ValidUser = await User.findById(req.user.id);
    const imageId = ValidUser.avatar.public_id;
    await cloudinary.v2.uploader.destroy(imageId);
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });
  }

  newUserData.avatar = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };

  const newUser = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
  });
  res.status(200).json({ message: "Profile updated SuccessFully" });
});

export const updateUserRole = asyncHandler(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  await User.findByIdAndUpdate(req.params.id, newUserData, { new: true });
  res.status(200).json({ message: "Role Updated" });
});

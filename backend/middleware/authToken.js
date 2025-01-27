import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncErrors.js";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const verifyToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies ? req.cookies.access_token : null;
  if (!token) {
    return next(errorHandler(400, "Unauthorized"));
  }
  const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
  if (!decodeToken) {
    return next(errorHandler(400, "Not Authorized"));
  }
  req.user = await User.findById(decodeToken.id);
  next();
});

export const authorizedRole = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return next(
        errorHandler(
          403,
          `Role: ${req.user.role} is allowed to access this resource`
        )
      );
    }
    next();
  };
};

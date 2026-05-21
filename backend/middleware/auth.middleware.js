import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

//protect
export const protect = async (req, res, next) => {
  try {
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    const token = req.headers.authorization.split(" ")[1];

    //Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //Get user from DB
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found..",
      });
    }
    //Blocke user check

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked by admin",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({
      message: "Token Expired..",
      success: false,
    });
  }
};

//role based authentication

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(", ")}`,
        currentRole: req.user.role,
      });
    }
    next();
  };
};

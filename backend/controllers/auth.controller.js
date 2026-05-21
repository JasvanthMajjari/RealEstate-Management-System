import User from "../models/user.model.js";
import sendEmail from "../utils/sendEmail.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
//Register

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isApproved: role === "seller" ? false : true,
      isVerified: false,
      verificationToken,
    });

    try {
      await sendEmail({
        email,
        subject: "Verify Your Email - Real Estate Platform",
        message: `<p>Your email verification code is:</p>
                         <h2>${verificationToken}</h2>
                         <p>Please enter this code to activate your account</p>`,
      });
      console.log("Verification email sent to:", email);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      //we will still create the user
    }

    res.status(201).json({
      message:
        "User Registered. Please check your email for the verification code.",
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//login

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and Password are required..",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password..",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email amd password or contact support",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password..",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message:
          "Your account has been blocked by an admin. Please contact support..",
      });
    }

    //token

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );
    const safeUser = await User.findById(user._id).select("-password");
    res.json({
      message: "Login Successfully..",
      token,
      user: safeUser,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//to get user profile

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found.." });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Verify the email

export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res
        .status(400)
        .json({ message: "Email and code both are required.." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: " User not found.." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified.." });
    }

    if (user.verificationToken?.toString() !== code.toString()) {
      return res.status(400).json({ message: "Invalid verification code.." });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    res.status(200).json({
      message: "Email veified successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//forgot password

export const forgotPassword = async (req, res) => {
  try {
    console.log("REQUEST BODY: ", req.body);
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No user found with that email address" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

    const clientUrl = "https://real-estate-management-system-lemon.vercel.app"; //frontendUrl
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;
    const message = `<h2>Password Request</h2>
                                  <p> You requested a password reset. Please click on the link below to reset your password : </p>
                                  <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
                                  <p> This link will expire in 15 minutes.</p>`;

    let emailSent = false;
    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset - Real Estate Platform",
        message,
      });
      emailSent = true;
    } catch (error) {
      console.error("Email sending failed:", error);
    }
    return res.status(200).json({
      success: true,
      message: emailSent
        ? "Reset email sent successfully.."
        : "User found but email failed to send",
    });
  } catch (error) {
    console.error("Forgot Password Error : ", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}; // for reset the password we require the email

// now to reset it(Password)
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Passsword must be atleast 6 characters",
      });
    }

    const cleanToken = token.trim();

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password rest token",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

import { NextFunction, Request, Response } from "express";
import { loginUserService, registerUserService } from "../../services/auth.service";
import User from "../../models/User.model";
import { generateToken } from "../../utils/jwt";
import { AuthRequest } from "../../types/auth.type";
import cloudinary from "../../utils/cloudinary";
import { uploadSingleImage } from "../../middlewares/image.upload";


/* =============================== resgister controller ================================ */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password, phone } = await req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    await registerUserService(name, email, password, phone);
    res.status(201).json({
      success: true,
      message: "Account created successfully",
    });
  } catch (error: any) {
    next(error);
  }
};

/* =============================== Login controller ================================ */

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    /* =============================== validation ================================ */

    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: "Email and password are required",
      });
    }

    /* =============================== find user ================================ */

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "We couldn't find an account with those credentials",
      });
    }

    /* =============================== blocked check ================================ */

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked. Please contact support.",
      });
    }

    /* =============================== login service ================================ */

    const result = await loginUserService(email, password);
    /* =============================== password check ================================ */

    if (!result.isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    /* =============================== generate token ================================ */

    const token = generateToken({
      userId: result.userExists._id.toString(),
      role: result.userExists.role,
    });

    /* =============================== set cookie ================================ */

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" ? true : false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    /* =============================== success response ================================ */

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
    });
  } catch (error) {
    next(error);
  }
};
/* =============================== me controller (current login user data) ================================ */
export const me = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(404).json({ status: false, message: "Unauthorized" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
/* =============================== logout ================================ */
export const logout = (req: Request, res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};



/* =============================== update profile ================================ */
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    const image = req.file;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { name, phone } = req.body;

    let avatar = user.avatar;

    if (image) {
      if (user.avatar?.publicId) {
        await cloudinary.uploader.destroy(user.avatar.publicId);
      }

      avatar = await uploadSingleImage(image, "nexcart/users");
    }

    /* =============================== UPDATE USER ================================ */
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(name && { name }),
        ...(phone && { phone }),
        avatar,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
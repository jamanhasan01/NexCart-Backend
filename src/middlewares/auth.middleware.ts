import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, JWTPayload } from "../types/auth.type";

/* =============================== VERIFY TOKEN ================================ */
export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Session expired or not found. Please log in again.",
    });
  }

  const secret = process.env.JSON_TOKEN_SECRET;
  if (!secret) {
    return res.status(500).json({
      success: false,
      message: "Internal server configuration error. Please try again later.",
    });
  }

  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    req.user = decoded;
    return next(); // ✅ ONLY path forward
  } catch {
    return res.status(401).json({
      success: false,
      message: "Your session is invalid or has expired. Please log in again.",
    });
  }
};

// /* =============================== Verify admin Token ================================ */
// export const verifyAdmin = (
//   req: AuthRequest,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const user = req.user;
//   if (!user) {
//     return res.status(401).json({
//       success: false,
//       message: "Unauthorized",
//     });
//   }
//   if (user.role !== "admin") {
//     return res.status(403).json({
//       success: false,
//       message: "Admin access only",
//     });
//   }
//   next();
// };

/* =============================== Verify admin Token ================================ */
export const authorizeRoles =
  (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }
    // 2. Check if user's role matches any allowed roles
    if (!roles.includes(user.role)) {
      // Formats the allowed roles nicely for a cleaner developer/user experience if needed,
      // or you can use a generic "Access denied" message.
      const allowedRolesList = roles.join(" or ");

      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires a role of: ${allowedRolesList}.`,
      });
    }
    return next();
  };

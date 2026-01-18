import { NextFunction, Request, Response } from "express";


export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // ✅ Custom error (from service/controller)
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // ✅ Mongoose Validation Error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e: any) => e.message);


    return res.status(400).json({
      success: false,
      message: messages[0],
    });
  }

  // fallback
  res.status(500).json({
    success: false,
    message: err.message || "Server Error",
  });
};

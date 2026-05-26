/* =============================== IMPORTS ================================ */

import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { NextFunction } from "express";
import crypto from "crypto";

/* =============================== MULTER MEMORY STORAGE ================================ */

const storage = multer.memoryStorage();

/* =============================== FILE FILTER ================================ */

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed"));
  }
};

/* =============================== CREATE UPLOADER ================================ */

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default upload;

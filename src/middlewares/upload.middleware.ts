// import multer, { Options } from "multer";
// import path from "path";
// import fs from "fs";
// /* =============================== this middleware for upload locally image store  ================================ */
// /* ===============================
//    Ensure upload directory exists
// ================================ */
// const uploadDir = path.join(process.cwd(), "public");

import multer, { Options } from "multer";

// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (_req, _file, cb) => {
//     cb(null, "public/");
//   },
//   filename: (_req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
//     cb(null, name);
//   },
// });

/* ===============================   FILE TYPE CHECK (THIS IS IT) ================================ */

const fileFilter: Options["fileFilter"] = (_req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // ✅ allow
  } else {
    cb(new Error("Only image files are allowed")); // ❌ block
  }
};

// /* ===============================
//    Upload Middleware
// ================================ */
// export const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB
//   },
// });
const storage=multer.memoryStorage()
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});


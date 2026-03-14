/* =============================== MULTER UPLOAD ================================ */

import multer from "multer"
import path from "path"
import fs from "fs"

export const createUploader = (folderName: string) => {

  const uploadPath = path.join(process.cwd(), "uploads", folderName)

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true })
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadPath)
    },

    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname)
      const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
      cb(null, name)
    },
  })

  const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"]

    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Only image files allowed"))
    }
  }

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  })
}
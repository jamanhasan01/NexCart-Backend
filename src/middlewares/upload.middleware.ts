/* =============================== IMPORTS ================================ */

import multer from 'multer'
import path from 'path'
import fs from 'fs'
import sharp from 'sharp'
import { NextFunction } from 'express'

/* =============================== MULTER MEMORY STORAGE ================================ */

const storage = multer.memoryStorage()

/* =============================== FILE FILTER ================================ */

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp']

  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only image files allowed'))
  }
}

/* =============================== CREATE UPLOADER ================================ */

export const createUploader = (folderName: string) => {
const uploadPath = path.join('/data/uploads', folderName)
   
   // const uploadPath = path.join(process.cwd(), 'uploads', folderName)
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true })
  }
  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  })


  /* =============================== IMAGE OPTIMIZER MIDDLEWARE ================================ */

  const optimizeImage = async (req: any, res: any, next: NextFunction) => {
    try {
      /* =============================== SINGLE FILE ================================ */

      if (req.file) {
        const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`
        const filepath = path.join(uploadPath, filename)

        await sharp(req.file.buffer).resize(400).webp({ quality: 80 }).toFile(filepath)

        req.file.filename = filename
        req.file.path = `/uploads/${folderName}/${filename}`
      }
      
      /* =============================== MULTIPLE FILES ================================ */

      if (req.files && Array.isArray(req.files)) {
        const images: string[] = []

        for (const file of req.files) {
          const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`
          const filepath = path.join(uploadPath, filename)

          await sharp(file.buffer).resize(1200).webp({ quality: 80 }).toFile(filepath)

          images.push(`/uploads/${folderName}/${filename}`)
        }

        req.body.images = images
      }

      next()
    } catch (error) {
      next(error)
    }
  }
  return {
    upload,
    optimizeImage,
  }
}

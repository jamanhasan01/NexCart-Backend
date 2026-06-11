import sharp from "sharp";
import cloudinary from "../utils/cloudinary";

/* =============================== Upload Multiple Images ================================ */

export const uploadMultipleImages = async (
  files: Express.Multer.File[],
  folder: string,
) => {
  const uploadedImages: {
    url: string;
    publicId: string;
  }[] = [];

  try {
    for (const file of files) {
      const uploaded = await uploadImage(file, folder);

      uploadedImages.push(uploaded);
    }

    return uploadedImages;
  } catch (error) {
    await Promise.all(
      uploadedImages.map((img) => cloudinary.uploader.destroy(img.publicId)),
    );

    throw error;
  }
};

/* =============================== Upload Image To Cloudinary ================================ */

 export const uploadImage = async (
  file: Express.Multer.File,
  folder: string,
  width = 1200,
  quality = 80,
) => {
  const optimizedBuffer = await sharp(file.buffer)
    .resize({
      width,
      withoutEnlargement: true,
    })
    .webp({
      quality,
    })
    .toBuffer();

  const base64 = `data:image/webp;base64,${optimizedBuffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};




export const uploadSingleImage = async (
  file: Express.Multer.File,
  folder: string,
) => {
  const optimizedBuffer = await sharp(file.buffer)
    .webp({ quality: 80 })
    .toBuffer();

  const base64 = `data:image/webp;base64,${optimizedBuffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};
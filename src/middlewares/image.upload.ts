import sharp from "sharp";
import cloudinary from "../utils/cloudinary";

export const multipleImageUpload = async (images: Express.Multer.File[]) => {
  const uploadedImages: {
    url: string;
    publicId: string;
  }[] = [];

  try {
    for (const image of images) {
      const optimizedBuffer = await sharp(image.buffer)
        .resize({
          width: 1200,
          withoutEnlargement: true,
        })
        .webp({
          quality: 80,
        })
        .toBuffer();
      const base64 = `data:image/webp;base64,${optimizedBuffer.toString(
        "base64",
      )}`;

      const result = await cloudinary.uploader.upload(base64, {
        folder: "nexcart/products",
      });

      uploadedImages.push({
        url: result.secure_url,
        publicId: result.public_id,
      });
    }

    return uploadedImages;
  } catch (error) {
    // rollback all uploaded images
    await Promise.all(
      uploadedImages.map((img) => cloudinary.uploader.destroy(img.publicId)),
    );

    throw error;
  }
};

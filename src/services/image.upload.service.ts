import Product from "../models/Product.model";
import User from "../models/User.model";
import cloudinary from "../utils/cloudinary";

// ================================ Single image upload for users ===============================
export const singleImageUploadService = async (
  file: Express.Multer.File,
  id: string
) => {
  try {
    if (!file) {
      throw new Error("No file received");
    }
    const uploadCloudinary = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "e-commerce/users" }, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        })
        .end(file.buffer);
    });

    const image = {
      publicId: uploadCloudinary.public_id,
      url: uploadCloudinary.secure_url,
    };

    const userFind = await User.findByIdAndUpdate(id, { image });
    return userFind;
  } catch (error: any) {
    throw new Error(error.message || "Image upload failed");
  }
};

// ================================ Multiple image upload for products ===============================
export const multipleImageUploadService = async (
  files: Express.Multer.File[],
  id: string
) => {
  try {
    if (!files || files.length === 0) {
      throw new Error("No files received");
    }

    const uploadResults = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream(
                { folder: "e-commerce/products" },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result);
                }
              )
              .end(file.buffer);
          })
      )
    );

    const images = uploadResults.map((img: any) => ({
      publicId: img.public_id,
      url: img.secure_url,
    }));

    const productFind = await Product.findByIdAndUpdate(id, { images });


    
    return productFind;
  } catch (error: any) {
    throw new Error(error.message || "Image upload failed");
  }
};

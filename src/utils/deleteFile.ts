/* =============================== IMPORTS ================================ */
import fs from "fs";
import path from "path";

/* =============================== DELETE FILE ================================ */
export const deleteFile = (filePath: string) => {
  try {
    if (!filePath) return;

    /* =============================== CLEAN PATH ================================ */
    const cleanPath = filePath.replace(/^\/+/, ""); // remove leading "/"

    /* =============================== FULL PATH ================================ */
    const fullPath = path.join("/data", cleanPath);

    /* =============================== DELETE ================================ */
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    
    } else {
      console.warn("File not found:", fullPath);
    }
  } catch (error) {
    console.error("File delete error:", error);
  }
};

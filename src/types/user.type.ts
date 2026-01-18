import { Document } from "mongoose";
/* ===============================
   Image Type
================================ */
export interface IUserImage {
  url: string;
  publicId: string;
}

/* ===============================
    TypeScript Interface
================================ */
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  image?: IUserImage;
  role: "customer" | "admin" | "super_admin";
  phone: string;
  isBlocked: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

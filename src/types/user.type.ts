import { Document } from "mongoose";
/* ===============================
   Image Type
================================ */


/* ===============================
    TypeScript Interface
================================ */
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: "customer" | "admin" | "super_admin";
  phone: string;
  isBlocked: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

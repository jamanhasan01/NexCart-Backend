import mongoose, { Schema, Model } from "mongoose";
import bcrypt from "bcrypt";
import { IUser } from "../types/user.type";

/* ===============================
    Mongoose Schema
================================ */
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],

      validate: {
        validator: (v: string) => v.length >= 8,
        message: "Password must be at least 8 characters long",
      },
      select: false,
    },
    image: {
      publicId: { type: String },
      url: { type: String },
    },

    role: {
      type: String,
      enum: ["customer", "admin", "super_admin"],
      default: "customer",
    },
phone: {
  type: String,
  required: [true, "Phone number is required"],
  match: [
    /^(?:\+880|880|0)1[3-9]\d{8}$/,
    "Invalid Bangladeshi phone number",
  ],
},

    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/* ===============================
   3Password Hash Middleware
================================ */
userSchema.pre<IUser>("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

/* ===============================
   Password Compare Method
================================ */
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

/* ===============================
    Safe Model Export
================================ */
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;

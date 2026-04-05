import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes";
import userRoute from "./routes/user.routes";
import productRoute from "./routes/product.routes";
import categoryRoute from "./routes/category.routes";
import orderRoute from "./routes/order.route";
import cartRoute from "./routes/cart.route";
import cookieParser from "cookie-parser";

import connectDB from "./config/connectDB";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.middleware";


dotenv.config();

const app = express();

/* =============================== CORS CONFIG ================================ */
const allowedOrigins = ["https://zunivabd.com","http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);

/* ===============================
   Global Middleware
================================ */
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
/* ===============================
   Connect DB
================================ */
connectDB();

/* ===============================
   Test Route
================================ */
app.get("/", (_req, res) => {
  res.send("server running well");
});

/* =============================== static uploads ================================ */

/* =============================== static uploads ================================ */
app.use("/uploads", express.static("/data/uploads"));
// app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))
/* =============================== All Route Global middle ware ================================ */
app.use("/api/auth", authRoutes);
app.use("/api", userRoute);
app.use("/api", productRoute);
app.use("/api", categoryRoute);
app.use("/api", cartRoute);
app.use("/api", orderRoute);

/* =============================== Global error middleware ================================ */
app.use(errorMiddleware);
/* ===============================
   Server Start
================================ */
app.listen(process.env.PORT, () => {
  console.log("server running on", process.env.PORT);
});

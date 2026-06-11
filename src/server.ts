import express from "express";
import dotenv from "dotenv";
import authV1Route from "./v1/routes/v1.auth.routes";
import userV1Route from "./v1/routes/v1.user.routes";
import productV1Route from "./v1/routes/v1.product.routes";
import categoryV1Route from "./v1/routes/v1.category.routes";
import orderV1Route from "./v1/routes/v1.order.route";
import cartV1Route from "./v1/routes/v1.cart.route";
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
app.use("/api/v1/auth", authV1Route);
app.use("/api/v1", userV1Route);
app.use("/api/v1", productV1Route);
app.use("/api/v1", categoryV1Route);
app.use("/api/v1", cartV1Route);
app.use("/api/v1", orderV1Route);

/* =============================== Global error middleware ================================ */
app.use(errorMiddleware);
/* ===============================
   Server Start
================================ */
app.listen(process.env.PORT, () => {
  console.log("server running on", process.env.PORT);
});

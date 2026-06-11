import { Router } from "express";


import { login, logout, me, register, updateProfile } from "../controllers/v1.auth.controller";
import upload from "../../middlewares/multer.middleware";
import { verifyToken } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/register", upload.none(), register);

router.post("/login", login);
router.post("/logout", logout);
router.get("/me", verifyToken, me);
router.patch("/me", verifyToken, upload.single("avatar"), updateProfile);

export default router;

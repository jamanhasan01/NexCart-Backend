import { Router } from "express";

import { verifyToken } from "../middlewares/auth.middleware";
import { updateProfile } from "../controllers/user.controller";
import upload from "../middlewares/multer.middleware";
import { login, logout, me, register } from "../controllers/auth.controller";

const router = Router();

router.post("/register", upload.none(), register);

router.post("/login", login);
router.post("/logout", logout);
router.get("/me", verifyToken, me);
router.patch("/me", verifyToken, upload.single("avatar"), updateProfile);

export default router;

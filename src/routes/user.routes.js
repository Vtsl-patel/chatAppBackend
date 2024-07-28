import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(upload.single("profilePicture"), registerUser)
router.route("/login").post(loginUser)
router.route("/logout").get(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router
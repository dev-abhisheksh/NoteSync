import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getProfile, loginUser, logOutUser, registerUser, updatePassword, updateProfile, resetPassword, forgotPassword, updateNote } from "../controllers/user.controller.js";

const router = Router();

// comman routed
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

//Secured routes
router.post("/logout", verifyJWT, logOutUser);
router.get("/me", verifyJWT, getProfile)
router.patch("/update-user", verifyJWT, updateProfile)
router.patch("/update-password", verifyJWT, updatePassword)
router.put("/update-note/:id", verifyJWT, updateNote); 


export default router;

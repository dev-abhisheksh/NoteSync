import dotenv from "dotenv"
dotenv.config()

import { Users } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if (!token) {
            return res.status(401).json({ message: "Unauthorized Access!" })
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await Users.findOne({
            $or: [
                {email: decodedToken.email},
                {username: decodedToken.username}
            ]
        }).select("-password -refreshToken");

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error("JWT Verification failed:", error.message);
        return res.status(401).json({ message: "Invalid or expired token!" });
    }
}
import { Users } from "../models/user.model.js";
import { Note } from "../models/note.model.js"; // adjust path as needed
import mongoose from "mongoose";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()
import crypto from "crypto";
// import { Users } from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await Users.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new Error("Something went wrong while generating tokens");
    }
}

//Register User
const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log(`email: ${email} username: ${username}`)

        if ([username, email, password].some((field) => field?.trim() === "")) {
            return res.status(400).json({ message: "All fields are mandatory!!!" })
        }

        //Check if the user is already registered
        const existingUser = await Users.findOne({
            $or: [{ username }, { email }]
        })

        if (existingUser) {
            throw new Error("User already existed")
        }

        const user = await Users.create({
            username: username.toLowerCase(),
            email,
            password
        })

        const createdUser = await Users.findById(user._id).select(
            "-password -refreshToken"
        )

        if (!createdUser) {
            throw new Error("Failed to create user")
        }
        console.log("User created:", user);
        console.log("Looking up user by ID:", user._id);

        return res.status(200).json({ message: "User registered successfullty" })
    } catch (error) {
        console.error("Error during registration:", error.message);
        res.status(500).json({ message: "Something went wrong while registering user" });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password, username } = req.body;
        console.log("BODY:", req.body); // Log incoming data

        if (!email && !password) {
            throw new Error("Both fields are required")
        }

        const user = await Users.findOne({
            $or: [{ email }, { username }]
        })
        console.log("Found user:", user);
        if (!user) {
            throw new Error("Cant find user")
        }

        const isPasswordValid = await user.isPasswordCorrect(password)
        console.log("Password valid:", isPasswordValid);

        if (!isPasswordValid) {
            throw new Error("Invalid password")
        }
        const { refreshToken, accessToken } = await generateAccessAndRefreshToken(user._id);

        const options = {
            httpOnly: true,
            secure: true,  // Changed to false for HTTP testing
            sameSite: 'lax'
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({ message: "User logged in successfully" })
    } catch (error) {
        return res.status(500).json({ message: "Faild login" })
    }
}

const logOutUser = async (req, res) => {
    try {
        await Users.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    refreshToken: undefined
                }
            },
            {
                new: true
            }
        )

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .clearCookie("refreshToken", options)
            .clearCookie("accessToken", options)
            .json({ message: "User logged out successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Unauthorized" })
    }
}

const getProfile = async (req, res) => {
    try {
        const user = req.user;
        res.status(200).json({
            success: true,
            message: "User profile fetched successfully!!!",
            user
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server issue yr not at fault bro" })
    }
}

const updateProfile = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ success: false, message: "Username is required" });
        }
        const user = await Users.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    username
                }
            },
            { new: true }
        ).select("-password")

        return res.status(200).json({
            success: true,
            message: "Account details updated successfully",
            user
        })

    } catch (error) {
        return res.status(500).json({ message: "Updation failed" })
    }
}

const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const user = await Users.findById(req.user?._id)

        if (!user) {
            throw new Error("User not found")
        }

        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

        if (!isPasswordCorrect) {
            throw new Error("Invalid old password")
        }
        user.password = newPassword;
        await user.save({ validateBeforeSave: false })

        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to update password" })
    }
}

// you'll need to create this

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await Users.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 15 mins
    await user.save({ validateBeforeSave: false });
    const savedUser = await Users.findById(user._id);
    console.log("Saved user after password reset token set:", savedUser);

    const resetUrl = `https://note-sync-backend.onrender.com/reset-password/${resetToken}`; // frontend URL
    const message = `Reset your password using the link: ${resetUrl}`;

    try {
        await sendEmail(user.email, "Password Reset", message);
        res.status(200).json({ message: "Password reset link sent to your email" });
        console.log("Reset token (raw):", resetToken);
        console.log("Reset token (hashed):", hashedToken);

    } catch (err) {
        // user.resetPasswordToken = undefined;
        // user.resetPasswordExpire = undefined;
        // await user.save({ validateBeforeSave: false });
        res.status(500).json({ message: "Failed to send email" });
    }
};


const resetPassword = async (req, res) => {
    try {
        const { token } = req.params; // token from /reset-password/:token
        const { password } = req.body; // from frontend form

        // 1️⃣ Validate new password
        if (!password || password.trim().length < 6) {
            return res
                .status(400)
                .json({ message: "Password must be at least 6 characters long" });
        }

        // 2️⃣ Hash token from URL for DB lookup
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        // 3️⃣ Find user with valid token that hasn't expired
        const user = await Users.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Token is invalid or has expired" });
        }

        // 4️⃣ Hash the new password
        user.password = password;  // raw password
        await user.save();

        // 5️⃣ Clear reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        // 6️⃣ Save once
        await user.save();

        console.log("Password reset for:", user.email);

        res.status(200).json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        console.error("Error in password reset:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// controllers/notesController.js
const updateNote = async (req, res) => {
    try {
        const { id } = req.params; // Get the note ID from the URL
        const { title, content, tags, isPublic } = req.body; // Get updated data

        // Find the note by ID and update it
        const updatedNote = await Note.findByIdAndUpdate(
            id,
            { title, content, tags, isPublic }, // Update all provided fields
            { new: true, runValidators: true } // Return updated note & validate
        );

        // If note not found
        if (!updatedNote) {
            return res.status(404).json({ message: "Note not found" });
        }

        // Success
        res.json({
            message: "Note updated successfully",
            note: updatedNote
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



export {
    registerUser,
    loginUser,
    logOutUser,
    getProfile,
    updateProfile,
    updatePassword,
    forgotPassword,
    resetPassword,
    updateNote
}
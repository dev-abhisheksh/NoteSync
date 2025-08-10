import { Users } from "../models/user.model.js";
import { Note } from "../models/note.model.js";

const getAllUsers = async (req, res) => {
    const users = await Users.find().select("-password")
    res.json(users)
}

const getUserById = async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ message: "Give unique identifier" })
    }
    const user = await Users.findOne({ username }).select("-password");
    // const user = await Users.findById(req.params.id).select("-password");
    if (!user) {
        return res.status(404).json({ message: "User not foudn" })
    }
    res.json(user)
}

const deleteUser = async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(401).json({ message: "provide id or email to delete" })
    }

    const user = await Users.findOneAndDelete({ username }).select("-password");
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted!!!" })

}


const updateRole = async (req, res) => {
    try {
        const { username, role } = req.body;

        if (!username || !role) {
            return res.status(400).json({ message: "Username and role are required" });
        }

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const user = await Users.findOneAndUpdate(
            { username: { $regex: `^${username}$`, $options: 'i' } }, // case-insensitive match
            { $set: { role } },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("Frontend sent:", username, role);

        res.json({ message: `Role updated to '${role}'`, user });

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};



export {
    getAllUsers,
    getUserById,
    deleteUser,
    updateRole
}
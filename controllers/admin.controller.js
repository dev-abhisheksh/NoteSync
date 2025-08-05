import { Users } from "../models/user.model.js";

const getAllUsers = async (req, res) => {
    const users = await Users.find().select("-password")
    res.json(users)
}

const getUserById = async (req, res) => {
    const { _id, email, username } = req.body;

    if (!_id && !username && !email) {
        return res.status(401).json({ message: "Give unique identifier" })
    }
    const user = await Users.findOne({
        $or: [{ _id }, { username }, { email }]
    })
    // const user = await Users.findById(req.params.id).select("-password");
    if (!user) {
        return res.status(404).json({ message: "User not foudn" })
    }
    res.json(user)
}

const deleteUser = async (req, res) => {
    const { _id, email } = req.body;

    if (!email && !_id) {
        return res.status(401).json({ message: "provide id or email to delete" })
    }

    const user = await Users.findOneAndDelete({
        $or: [{ email: email }, { _id: _id }]
    })
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted!!!" })

}


const updateRole = async (req, res) => {
    const { username, email, _id, role } = req.body;
    if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" })
    }

    const user = await Users.findOneAndUpdate(
        { $or: [{ username }, { email }, { _id }] },
        {
            $set: {
                role: role
            }
        },
        { new: true }
    ).select("-password")

    if (!user) {
        return res.status(404).json({ message: "User nit found" })
    }
    res.json({ message: "User upadted successfully" })
}


export {
    getAllUsers,
    getUserById,
    deleteUser,
    updateRole
}
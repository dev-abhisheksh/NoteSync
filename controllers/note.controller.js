import { Note } from "../models/note.model.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { Users } from "../models/user.model.js";

const createNote = async (req, res) => {
    const { name, content, isPublic, tags } = req.body;
    if (!name && !content && !isPublic) {
        return res.status(400).json({ message: "Each field is mandatory!!!" })
    }
    const userId = req.user._id

    try {
        const note = await Note.create({
            name,
            content,
            isPublic,
            tags,
            owner: userId
        });

        return res.status(200).json({ message: "Note created successfully", note })
    } catch (error) {
        return res.status(500).json({ message: "Failed to create note", error })
    }
}

const getAllNotes = async (req, res) => {
    const notes = await Note.find();
    res.json(notes)
}

const editNote = async (req, res) => {
    const { id, content } = req.body;
    if (!id) {
        return res.status(400).json({ message: "Username is mandorty" })
    }

    const note = await Note.findByIdAndUpdate(
        id,
        {
            $set: { content }
        },
        { new: true }
    )

    return res.status(200).json({ message: "Upafted successfullt", note })
}

// const getSingleUserNotes = async (req, res) => {
//     try {
//         const { username } = req.cookies;
//         if (!username) {
//             return res.status(400).json({ message: "Enter usename" })
//         }

//         const user = await Users.findOne({ username })
//         if (!user) {
//             return res.status(404).json({ message: "User not found" })
//         }

//         const notes = await Note.find({ owner: user._id });
//         if (notes.length === 0) {
//             return res.status(404).json({ message: "No notes found for this user", notes: [] });
//         }
//         console.log("notes", notes)
//         return res.status(200).json({ message: "Fetched notes successsfull", notes })
//     } catch (error) {
//         return res.status(500).json({ message: "Failed to fetch notes" })
//     }
// }
const getSingleUserNotes = async (req, res) => {
    try {
        // Get the authenticated user from req.user
        const user = req.user;

        // Fetch notes
        const notes = await Note.find({ owner: user._id });

        console
        return res.status(200).json({
            message: notes.length ? "Fetched notes successfully" : "No notes found for this user",
            notes: notes
        });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch notes", error: error.message });
    }
};



// DELETE /api/notes/:id
const deleteNote = async (req, res) => {
    try {
        const { id } = req.params; // get ID from URL
        if (!id) {
            return res.status(400).json({ message: "Provide note ID to delete it" });
        }

        const deletedNote = await Note.findByIdAndDelete(id);
        if (!deletedNote) {
            return res.status(404).json({ message: "Note not found" });
        }

        return res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


//search
const searchNotesByTag = async (req, res) => {
    try {
        const { tags } = req.body;

        if (!tags || !Array.isArray(tags) || tags.length === 0) {
            return res.status(400).json({ message: "Tags array is required" });
        }

        const searchedNotes = await Note.find({
            tags: { $in: tags },
            isPublic: true // ✅ Only fetch public notes
        });

        if (!searchedNotes || searchedNotes.length === 0) {
            return res.status(404).json({ message: "No public notes found for given tags" });
        }

        return res.status(200).json({
            message: "Successfully fetched public notes based on tags",
            searchedNotes
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error while searching notes" });
    }
};




export {
    createNote,
    editNote,
    deleteNote,
    getAllNotes,
    getSingleUserNotes,
    searchNotesByTag
}
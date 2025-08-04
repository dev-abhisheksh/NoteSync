import mongoose from "mongoose"

const noteSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    isPublic: {
        type: Boolean,
        required: true
    },
    tags: {
        type: String
    }
},{timestamps: true})


export const Note = mongoose.model("Note", noteSchema)
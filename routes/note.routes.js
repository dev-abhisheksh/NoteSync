import express from "express"
import { createNote, deleteNote, getAllNotes, getSingleUserNotes, editNote, searchNotesByTag } from "../controllers/note.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js"

const router = express.Router();

router.post("/create", verifyJWT,upload.array('files', 5), createNote)
router.get("/get-notes", verifyJWT, getAllNotes)
router.get("/get-user-notes", verifyJWT, getSingleUserNotes)
router.post("/edit-note", verifyJWT, editNote)
router.delete("/delete-note/:id", verifyJWT, deleteNote); 
router.post("/search", searchNotesByTag)

export default router;
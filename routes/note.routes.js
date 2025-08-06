import express from "express"
import { createNote, deleteNote, getAllNotes, getSingleNote, editNote, searchNotesByTag } from "../controllers/note.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create", verifyJWT, createNote)
router.get("/get-notes", verifyJWT,getAllNotes)
router.get("/get-user-notes",verifyJWT, getSingleNote)
router.post("/edit-note", verifyJWT,editNote)
router.post("/delete-note", verifyJWT, deleteNote)
router.post("/seach", verifyJWT, searchNotesByTag)

export default router;
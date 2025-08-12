import express from "express"
import dotenv from "dotenv"
dotenv.config();
import cors from "cors"
import cookieParser from "cookie-parser"
import userRoutes from "./routes/user.routes.js"
import adminRoutes from "./routes/admin.routes.js"
import noteRoutes from "./routes/note.routes.js"
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


//middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
// app.use(express.json()); // Parses incoming JSON payloads
app.use(express.static('public'));
app.use(cookieParser());
app.use(express.json());

//routes
app.use("/", userRoutes)
app.use('/api/admin', adminRoutes);
app.use('/', noteRoutes);

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/create", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "createNote.html"));

});
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/update-note", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "updateNote.html"));
});

app.get("/forgot-password", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "forgotPass.html"));
});

app.get("/reset-password/:token", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "resetPass.html"));
})


export { app }
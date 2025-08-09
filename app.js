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
app.use(cookieParser());

//routes
app.use("/", userRoutes)
app.use('/admin', adminRoutes);
app.use('/', noteRoutes);

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

export { app }
import express from "express"
import dotenv from "dotenv"
dotenv.config();
import cors from "cors"
import cookieParser from "cookie-parser"
import userRoutes from "./routes/user.routes.js"
import adminRoutes from "./routes/admin.routes.js"

const app = express();


//middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
// app.use(express.json()); // Parses incoming JSON payloads

app.use(express.json());
app.use(cookieParser());

//routes
app.use("/", userRoutes)
app.use('/admin', adminRoutes);

export { app }
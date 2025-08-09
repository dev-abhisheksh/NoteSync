import express from "express"
import { app } from "./app.js";
import dbConnection from "./utils/dbConnection.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config()
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
dbConnection()

    .then(() => {
        app.listen(process.env.PORT || 5000, () => {
            console.log(`Server running on port ${process.env.PORT}`)
        })
    })
    .catch((error) => {
        console.log(`MongoDb Connection failed!!!`)
    })


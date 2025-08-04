import mongoose from "mongoose";

const dbConnection = async()=>{
    try {
        const conn = await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log(`MongoDb Connection Successfull || DB Host ${conn.connection.host}`)
    } catch (error) {
        console.log("Error connecting DB", error);
        process.exit(1)
    }
}

dbConnection();

export default dbConnection
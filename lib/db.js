import mongoose from "mongoose";

const DB = async () => {
    try {
        if (mongoose.connection.readyState >= 1) {
            return;
        }

        await mongoose.connect(process.env.MONGO_URI || "mongodb://mongo:27017/taskDB");
        console.log("Database Connected");
    } catch (error) {
        console.error("Database connection failed:", error);
        throw error;
    }
};

export default DB;
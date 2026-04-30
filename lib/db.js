import mongoose from "mongoose";

const DB = async () => {
    try {
        if (mongoose.connection.readyState >= 1) {
            return;
        }

        const uri = process.env.MONGO_URI;
        if (!uri) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }
        
        if (process.env.NODE_ENV === "production" && (uri.includes("localhost") || uri.includes("127.0.0.1"))) {
            console.warn("WARNING: You are using a local MongoDB URI in production (Vercel). This will NOT work.");
        }

        await mongoose.connect(uri);
        console.log("Database Connected successfully");
    } catch (error) {
        console.error("CRITICAL: Database connection failed:", error.message);
        throw new Error(`Database connection failed: ${error.message}`);
    }
};

export default DB;
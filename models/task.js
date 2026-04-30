import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
    userId: String,
    input: String,
    operation: String,
    status: { type: String, default: "pending" },
    result: String,
    logs: String,
}, { timestamps: true })

const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

export default Task;
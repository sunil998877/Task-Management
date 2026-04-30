import DB from "@/lib/db";
import Task from "@/models/task";
import { addJob } from "@/lib/queue";

export async function POST(req) {
    try {
        const { input, operation } = await req.json();
        await DB();

        const task = await Task.create({
            input,
            operation,
            status: "pending",
        });

        await addJob({
            taskId: task._id,
            input,
            operation
        });

        return Response.json({
            message: "Task Created",
            taskId: task._id,
        });
    } catch (error) {
        console.error("Task creation error:", error);
        return Response.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        await DB();
        const tasks = await Task.find().sort({ createdAt: -1 });
        return Response.json({ tasks });
    } catch (error) {
        console.error("Task fetch error:", error);
        return Response.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return Response.json({ error: "Task ID is required" }, { status: 400 });
        }

        await DB();
        await Task.findByIdAndDelete(id);

        return Response.json({ message: "Task Deleted" });
    } catch (error) {
        console.error("Task deletion error:", error);
        return Response.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
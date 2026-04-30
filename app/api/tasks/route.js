import DB from "@/lib/db";
import Task from "@/models/task";
import queue from "@/lib/queue";

export async function POST(req) {
    const { input, operation } = await req.json();

    await DB();

    const task = await Task.create({
        input,
        operation,
        status: "pending",
    });

    await queue.add("task", {
        taskID: task._id,
        input,
        operation
    });

    return Response.json({
        message: "Task Created",
        taskId: task._id,
    });
}


export async function GET(req) {
    await DB();

    const tasks = await Task.find().sort({ createdAt: -1 });
    return Response.json({ tasks });
}

export async function DELETE(req) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return Response.json({ error: "Task ID is required" }, { status: 400 });
    }

    await DB();
    await Task.findByIdAndDelete(id);

    return Response.json({ message: "Task Deleted" });
}
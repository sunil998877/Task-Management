import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URI || "redis://redis:6379", {
    maxRetriesPerRequest: null,
});

const queue = new Queue("TaskQueue", { connection });

export default queue;
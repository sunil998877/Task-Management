import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URI || "redis://redis:6379", {
    maxRetriesPerRequest: null,
});

export const addJob = async (jobData) => {
    await connection.lpush("TaskQueue", JSON.stringify(jobData));
};

export default connection;
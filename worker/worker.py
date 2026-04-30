import os
from redis import Redis
from rq import Worker, Queue
import pymongo

# Redis connection
redis_uri = os.getenv("REDIS_URI", "redis://redis:6379")
redis_conn = Redis.from_url(redis_uri)

# Mongo connection
mongo_uri = os.getenv("MONGO_URI", "mongodb://mongo:27017/")
mongo = pymongo.MongoClient(mongo_uri)
db = mongo["taskDB"]

def process_task(job):
    task_id = job["taskId"]
    input_text = job["input"]
    op = job["operation"]

    db.tasks.update_one({"_id": task_id}, {"$set": {"status": "running"}})

    if op == "uppercase":
        result = input_text.upper()
    elif op == "lowercase":
        result = input_text.lower()
    elif op == "reverse":
        result = input_text[::-1]
    elif op == "wordcount":
        result = str(len(input_text.split()))
    else:
        result = "Invalid"

    db.tasks.update_one(
        {"_id": task_id},
        {"$set": {"status": "success", "result": result}}
    )

if __name__ == "__main__":
    queue = Queue("TaskQueue", connection=redis_conn)
    worker = Worker([queue], connection=redis_conn)
    worker.work()
import time
from redis import Redis
from rq import Worker, Queue
import pymongo
# remove the collection name from the mongo connection string

# Redis connection 
redis_conn = Redis(host="redis", port=6379)

# Mongo connection
mongo = pymongo.MongoClient("mongodb://mongo:27017/")
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
    queue = Queue("default", connection=redis_conn)
    worker = Worker([queue], connection=redis_conn)
    worker.work()
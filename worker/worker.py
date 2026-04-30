import os
import json
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from redis import Redis
import pymongo

# --- Health Check Server for Render ---
class HealthCheckHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"Worker is alive!")

def run_health_server():
    port = int(os.getenv("PORT", 8080))
    server = HTTPServer(("0.0.0.0", port), HealthCheckHandler)
    print(f"Health check server running on port {port}")
    server.serve_forever()

# --- Worker Logic ---
redis_uri = os.getenv("REDIS_URI", "redis://redis:6379")
redis_conn = Redis.from_url(redis_uri)

mongo_uri = os.getenv("MONGO_URI", "mongodb://mongo:27017/")
mongo = pymongo.MongoClient(mongo_uri)
db = mongo["taskDB"]

def process_task(job_data):
    try:
        task_id = job_data["taskId"]
        input_text = job_data["input"]
        op = job_data["operation"]

        print(f"Processing task {task_id}: {op} on '{input_text}'")
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
            result = "Invalid Operation"

        db.tasks.update_one(
            {"_id": task_id},
            {"$set": {"status": "success", "result": result}}
        )
        print(f"Task {task_id} completed!")
    except Exception as e:
        print(f"Error processing task: {e}")

if __name__ == "__main__":
    # Start health check server in a background thread
    threading.Thread(target=run_health_server, daemon=True).start()

    print("Worker started. Listening for tasks on 'TaskQueue'...")
    while True:
        try:
            task = redis_conn.blpop("TaskQueue", timeout=0)
            if task:
                job_data = json.loads(task[1])
                process_task(job_data)
        except Exception as e:
            print(f"Worker Error: {e}")
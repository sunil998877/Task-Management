FROM python:3.10-slim

WORKDIR /worker

COPY . .

RUN pip install redis rq pymongo

CMD ["python", "worker.py"]
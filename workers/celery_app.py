from __future__ import annotations

from celery import Celery

celery_app = Celery(
    "genwatch",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
)

celery_app.conf.beat_schedule = {
    "ingest-reddit-daily": {
        "task": "workers.tasks.ingestion.run_source",
        "schedule": 60 * 60 * 24,
        "args": ("reddit",),
    },
    "ingest-youtube-daily": {
        "task": "workers.tasks.ingestion.run_source",
        "schedule": 60 * 60 * 24,
        "args": ("youtube",),
    },
}


@celery_app.task(name="workers.tasks.ingestion.run_source")
def run_source(source_id: str) -> dict:
    from ingestion.runner import build_adapters

    adapter = build_adapters()[source_id]
    records = adapter.fetch()
    return {"source_id": source_id, "record_count": len(records)}

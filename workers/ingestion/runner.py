from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from ingestion.adapters import (
    DataSourceAdapter,
    RedditAdapter,
    StubAdapter,
)

ROOT = Path(__file__).resolve().parents[2]


class YouTubeAdapter(RedditAdapter):
    source_id = "youtube"
    platform = "youtube"


class GoogleTrendsAdapter(RedditAdapter):
    source_id = "google_trends"
    platform = "google_trends"


class RssAdapter(RedditAdapter):
    source_id = "rss"
    platform = "rss"


def build_adapters() -> dict[str, DataSourceAdapter]:
    return {
        "reddit": RedditAdapter(),
        "youtube": YouTubeAdapter(),
        "google_trends": GoogleTrendsAdapter(),
        "rss": RssAdapter(),
        "dark_social_stub": StubAdapter(
            "dark_social_stub", "whatsapp", "data/seeds/dark_social.json"
        ),
        "tgi_kantar_stub": StubAdapter(
            "tgi_kantar_stub", "tgi_kantar", "data/seeds/tgi_weights.json"
        ),
        "fgv_internal_stub": StubAdapter(
            "fgv_internal_stub", "fgv", "data/seeds/fgv_internal.json"
        ),
    }


def run_all_adapters() -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    for source_id, adapter in build_adapters().items():
        records = adapter.fetch()
        results.append(
            {
                "source_id": source_id,
                "record_count": len(records),
                "status": "success",
                "started_at": datetime.now(timezone.utc).isoformat(),
            }
        )
    return results

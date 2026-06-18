from __future__ import annotations

import json
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


@dataclass
class RawSignalRecord:
    source_id: str
    platform: str
    text: str
    url: str | None
    collected_at: datetime
    generation_hint: str | None = None
    region_hint: str | None = None
    metadata: dict[str, Any] | None = None


class DataSourceAdapter(ABC):
    source_id: str
    platform: str

    @abstractmethod
    def fetch(
        self,
        generation_id: str | None = None,
        since: datetime | None = None,
        region_id: str | None = None,
    ) -> list[RawSignalRecord]:
        raise NotImplementedError


class StubAdapter(DataSourceAdapter):
    def __init__(self, source_id: str, platform: str, fixture_file: str) -> None:
        self.source_id = source_id
        self.platform = platform
        self.fixture_path = Path(fixture_file)

    def fetch(
        self,
        generation_id: str | None = None,
        since: datetime | None = None,
        region_id: str | None = None,
    ) -> list[RawSignalRecord]:
        root = Path(__file__).resolve().parents[2]
        data = json.loads((root / self.fixture_path).read_text(encoding="utf-8"))
        records: list[RawSignalRecord] = []
        for item in data:
            hint = item.get("generation_hint")
            if generation_id and hint and hint != generation_id:
                continue
            records.append(
                RawSignalRecord(
                    source_id=item.get("source_id", self.source_id),
                    platform=item.get("platform", self.platform),
                    text=item["text"],
                    url=item.get("url"),
                    collected_at=datetime.now(timezone.utc),
                    generation_hint=hint,
                    region_hint=item.get("region_hint"),
                    metadata={"stub": True},
                )
            )
        return records


class RedditAdapter(DataSourceAdapter):
    source_id = "reddit"
    platform = "reddit"

    def fetch(
        self,
        generation_id: str | None = None,
        since: datetime | None = None,
        region_id: str | None = None,
    ) -> list[RawSignalRecord]:
        # MVP placeholder: live connector wired in Phase 2 with API credentials.
        return [
            RawSignalRecord(
                source_id=self.source_id,
                platform=self.platform,
                text="Placeholder Reddit signal about vestibular and ENEM trends.",
                url="https://reddit.com/r/brasil",
                collected_at=datetime.now(timezone.utc),
                generation_hint=generation_id or "z",
                metadata={"live": False, "note": "configure REDDIT_CLIENT_ID for live fetch"},
            )
        ]

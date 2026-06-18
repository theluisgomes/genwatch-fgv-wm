from __future__ import annotations

import io
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import yaml
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

ROOT = Path(__file__).resolve().parents[2]


def _load_report_spec() -> dict[str, Any]:
    path = ROOT / "specs" / "reports" / "inaugural.yaml"
    return yaml.safe_load(path.read_text(encoding="utf-8"))


def generate_inaugural_pdf(insights: list[dict[str, Any]], generations: list[dict[str, Any]]) -> bytes:
    spec = _load_report_spec()["report"]
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, title=spec["title"])
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "GenWatchTitle",
        parent=styles["Title"],
        textColor=colors.HexColor("#0e1520"),
        fontSize=22,
        spaceAfter=12,
    )
    body_style = ParagraphStyle(
        "GenWatchBody",
        parent=styles["BodyText"],
        textColor=colors.HexColor("#333333"),
        fontSize=10,
        leading=14,
    )
    section_style = ParagraphStyle(
        "GenWatchSection",
        parent=styles["Heading2"],
        textColor=colors.HexColor("#3ecfaa"),
        fontSize=13,
        spaceBefore=10,
        spaceAfter=6,
    )

    story: list[Any] = [
        Paragraph(spec["title"], title_style),
        Paragraph(spec["subtitle"], body_style),
        Spacer(1, 0.4 * cm),
        Paragraph(
            f"Gerado em {datetime.now(timezone.utc).strftime('%d/%m/%Y %H:%M UTC')}",
            body_style,
        ),
        Spacer(1, 0.6 * cm),
    ]

    for generation in generations:
        gen_insights = [i for i in insights if i["generation_id"] == generation["id"]]
        story.append(Paragraph(generation["label"], section_style))
        story.append(Paragraph(f"{generation['theme']} · {generation['cohort']}", body_style))
        story.append(Spacer(1, 0.2 * cm))
        for insight in gen_insights[:3]:
            trigger = insight.get("emotional_trigger") or "—"
            story.append(Paragraph(f"<b>{insight['title']}</b>", body_style))
            story.append(Paragraph(insight["narrative"], body_style))
            story.append(Paragraph(f"Gatilho: {trigger}", body_style))
            if insight.get("tgi_projection"):
                story.append(Paragraph(f"TGI: {insight['tgi_projection']}", body_style))
            story.append(Spacer(1, 0.2 * cm))

    doc.build(story)
    return buffer.getvalue()

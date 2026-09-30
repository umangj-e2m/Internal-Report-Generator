from datetime import datetime, timezone
from zoneinfo import ZoneInfo


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def format_display(value: datetime, tz_name: str, with_time: bool = True) -> str:
    local = value.astimezone(ZoneInfo(tz_name))
    return local.strftime("%d %b %Y, %I:%M %p") if with_time else local.strftime("%d %b %Y")

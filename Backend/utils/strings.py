import re

_WHITESPACE_RE = re.compile(r"\s+")


def normalize_whitespace(text: str | None) -> str:
    if not text:
        return ""
    return _WHITESPACE_RE.sub(" ", text).strip()


def truncate(text: str, max_chars: int, suffix: str = "…") -> str:
    """Shorten text at a word boundary so it never exceeds max_chars."""
    if len(text) <= max_chars:
        return text
    cut = text[: max_chars - len(suffix)].rsplit(" ", 1)[0].rstrip(" ,.;:-")
    return f"{cut}{suffix}"

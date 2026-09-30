import secrets
import string

from slugify import slugify

_SUFFIX_ALPHABET = string.ascii_lowercase + string.digits


def make_slug(text: str, suffix_length: int = 6) -> str:
    base = slugify(text, max_length=60, word_boundary=True) or "report"
    suffix = "".join(secrets.choice(_SUFFIX_ALPHABET) for _ in range(suffix_length))
    return f"{base}-{suffix}"

class ScraperError(Exception):
    """Base error for anything that stops a website from being read."""


class InvalidUrlError(ScraperError):
    pass


class FetchError(ScraperError):
    pass

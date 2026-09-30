from logging.config import dictConfig

LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"


def setup_logging(level: str = "INFO") -> None:
    dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "formatters": {"standard": {"format": LOG_FORMAT}},
            "handlers": {
                "console": {
                    "class": "logging.StreamHandler",
                    "formatter": "standard",
                },
            },
            "root": {"handlers": ["console"], "level": level.upper()},
            "loggers": {
                "httpx": {"level": "WARNING"},
                "uvicorn.access": {"handlers": ["console"], "level": "INFO", "propagate": False},
            },
        }
    )

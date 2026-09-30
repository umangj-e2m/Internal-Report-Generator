# log_config

Central logging setup (the SOP's `logging/` folder, renamed so it does not
shadow Python's built-in `logging` module).

- `setup_logging(level)` is called once in `app.py`.
- Level comes from `LOG_LEVEL` in `.env` (`DEBUG` locally, `INFO` in production).
- Format: `timestamp | LEVEL | logger name | message`.
- In code, always use `logger = logging.getLogger(__name__)`.

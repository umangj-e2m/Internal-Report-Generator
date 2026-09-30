from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Internal Report Generator"
    log_level: str = "INFO"
    api_prefix: str = "/api"

    app_host: str = "127.0.0.1"
    app_port: int = 8000
    app_reload: bool = True

    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/report_generator"

    cors_origins: list[str] = ["http://localhost:3000"]
    public_base_url: str = "http://localhost:3000"

    scraper_max_pages: int = 5
    scraper_timeout_seconds: float = 15.0
    scraper_max_bytes: int = 5_000_000
    scraper_user_agent: str = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/126.0 Safari/537.36 InternalReportGenerator/1.0"
    )
    summary_max_chars: int = 700

    report_brand_name: str = "E2M Solutions"
    report_logo_path: Path = BASE_DIR.parent / "Frontend" / "public" / "E2M_Logo-Black.png"
    report_timezone: str = "Asia/Kolkata"

    @field_validator("report_logo_path")
    @classmethod
    def _resolve_logo_path(cls, value: Path) -> Path:
        return value if value.is_absolute() else (BASE_DIR / value).resolve()


@lru_cache
def get_settings() -> Settings:
    return Settings()

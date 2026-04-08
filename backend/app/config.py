import json
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=None,  # Don't read from .env file, use environment variables only
    )

    # App
    app_name: str = Field(default="NelloreRuchullu API", alias="APP_NAME")
    version: str = Field(default="1.0.0", alias="VERSION")
    environment: str = Field(default="development", alias="ENVIRONMENT")
    debug: bool = Field(default=False, alias="DEBUG")
    api_prefix: str = Field(default="/api/v1")

    # Database
    database_url: str = Field(
        default="postgresql+asyncpg://bello:bello_secret_2024@localhost:5432/bello"
    )

    # Redis
    redis_url: str = Field(default="redis://localhost:6379/0")

    # JWT
    secret_key: str = Field(default="change-this-in-production")
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    algorithm: str = "HS256"

    # Razorpay
    razorpay_key_id: str = Field(default="rzp_test_1234567890")
    razorpay_key_secret: str = Field(default="test_secret_1234567890")
    razorpay_webhook_secret: str = Field(default="webhook_secret_123")

    # Email (SMTP)
    smtp_host: str = Field(default="smtp.gmail.com")
    smtp_port: int = 587
    smtp_user: str = Field(default="noreply@nellore-ruchullu.com")
    smtp_password: str = Field(default="")

    # SMS (Twilio)
    twilio_account_sid: str = Field(default="")
    twilio_auth_token: str = Field(default="")
    twilio_from_number: str = Field(default="+919999999999")

    # Frontend
    frontend_url: str = Field(default="http://localhost:3000")

    # Rate limiting
    rate_limit_per_minute: int = Field(default=30)
    rate_limit_login_per_hour: int = Field(default=10)
    rate_limit_otp_per_hour: int = Field(default=5)

    # CORS
    cors_origins: list[str] = Field(
        default=["http://localhost:3000", "http://localhost:8000"]
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                # Fallback: split by comma
                return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v


settings = Settings()

import json
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # App
    app_name: str = Field(default="NelloreRuchullu API", alias="APP_NAME")
    version: str = Field(default="1.0.0", alias="VERSION")
    environment: str = Field(default="development", alias="ENVIRONMENT")
    debug: bool = Field(default=False, alias="DEBUG")
    api_prefix: str = Field(default="/api/v1")

    # Database
    database_url: str = Field(
        default="postgresql+asyncpg://bello:bello_secret_2024@localhost:5432/bello",
        alias="DATABASE_URL"
    )

    # Redis
    redis_url: str = Field(default="redis://localhost:6379/0", alias="REDIS_URL")

    # JWT
    secret_key: str = Field(default="change-this-in-production", alias="SECRET_KEY")
    access_token_expire_minutes: int = 15

    @property
    def is_production(self) -> bool:
        return self.environment == "production"
    refresh_token_expire_days: int = 7
    algorithm: str = "HS256"

    # Razorpay
    razorpay_key_id: str = Field(default="rzp_test_1234567890", alias="RAZORPAY_KEY_ID")
    razorpay_key_secret: str = Field(default="test_secret_1234567890", alias="RAZORPAY_KEY_SECRET")
    razorpay_webhook_secret: str = Field(default="webhook_secret_123", alias="RAZORPAY_WEBHOOK_SECRET")

    # Email (SMTP)
    smtp_host: str = Field(default="smtp.gmail.com", alias="SMTP_HOST")
    smtp_port: int = 587
    smtp_user: str = Field(default="noreply@nellore-ruchullu.com", alias="SMTP_USER")
    smtp_password: str = Field(default="", alias="SMTP_PASSWORD")

    # SMS (Twilio)
    twilio_account_sid: str = Field(default="", alias="TWILIO_ACCOUNT_SID")
    twilio_auth_token: str = Field(default="", alias="TWILIO_AUTH_TOKEN")
    twilio_from_number: str = Field(default="+919999999999", alias="TWILIO_FROM_NUMBER")

    # Frontend
    frontend_url: str = Field(default="http://localhost:3000", alias="FRONTEND_URL")

    # Rate limiting
    rate_limit_per_minute: int = Field(default=30)
    rate_limit_login_per_hour: int = Field(default=10)
    rate_limit_otp_per_hour: int = Field(default=5)


settings = Settings()

# Validate SECRET_KEY in production
if settings.is_production and settings.secret_key == "change-this-in-production":
    raise ValueError(
        "SECRET_KEY must be explicitly set in production environment. "
        "Set the SECRET_KEY environment variable to a secure random value."
    )

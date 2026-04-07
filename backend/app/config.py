from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # App
    app_name: str = "NelloreRuchullu API"
    version: str = "1.0.0"
    environment: str = "development"
    debug: bool = False
    api_prefix: str = "/api/v1"

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


settings = Settings()

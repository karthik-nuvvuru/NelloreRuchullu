"""Pydantic v2 schemas for address endpoints."""

from __future__ import annotations

from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, Field


class AddressType(StrEnum):
    HOME = "home"
    WORK = "work"
    OTHER = "other"


class AddressCreate(BaseModel):
    address_line1: str = Field(min_length=1, max_length=255)
    address_line2: str | None = None
    city: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=1, max_length=100)
    country: str = Field(default="India", max_length=2, min_length=2)
    pincode: str = Field(min_length=6, max_length=10)
    landmark: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    address_type: AddressType = AddressType.HOME
    is_default: bool = False


class AddressUpdate(BaseModel):
    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    pincode: str | None = None
    landmark: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    address_type: AddressType | None = None
    is_default: bool | None = None


class AddressResponse(BaseModel):
    id: UUID
    user_id: UUID
    address_line1: str
    address_line2: str | None
    city: str
    state: str
    country: str
    pincode: str
    landmark: str | None
    latitude: float | None
    longitude: float | None
    address_type: AddressType
    is_default: bool

    model_config = {"from_attributes": True}

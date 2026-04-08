"""Order model with status tracking."""
from __future__ import annotations

from datetime import datetime
from enum import Enum as PyEnum
from uuid import UUID, uuid4

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class OrderStatus(str, PyEnum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    READY_FOR_PICKUP = "ready_for_pickup"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class Order(Base):
    __tablename__ = "orders"
    __table_args__ = (
        Index("ix_orders_user_id", "user_id"),
        Index("ix_orders_order_number", "order_number", unique=True),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
    order_number: Mapped[str] = mapped_column(String(20), unique=True)
    status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus), default=OrderStatus.PENDING
    )
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2))
    tax_amount: Mapped[float] = mapped_column(Numeric(10, 2))
    discount_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2))
    delivery_fee: Mapped[float] = mapped_column(Numeric(10, 2))
    delivery_address_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("addresses.id"), nullable=True
    )
    delivery_partner_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("users.id"), nullable=True
    )
    notes: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    coupon_code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    cancelled_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    cancelled_reason: Mapped[str | None] = mapped_column(
        String(500), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user = relationship("User", foreign_keys=[user_id], back_populates="orders")
    delivery_address = relationship("Address", foreign_keys=[delivery_address_id])
    delivery_partner = relationship("User", foreign_keys=[delivery_partner_id])
    items = relationship("OrderItem", back_populates="order", lazy="selectin")
    payment = relationship("Payment", back_populates="order", uselist=False, lazy="selectin")
    delivery_record = relationship("Delivery", back_populates="order", uselist=False, lazy="selectin")

    @property
    def item_count(self) -> int:
        return len(self.items)

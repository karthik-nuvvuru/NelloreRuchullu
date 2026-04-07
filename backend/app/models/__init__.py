"""Import all models so Alembic can discover them."""
from app.models.address import Address
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.category import Category
from app.models.coupon import Coupon, CouponType
from app.models.delivery import Delivery, DeliveryStatus
from app.models.menu_item import MenuItem
from app.models.order import Order, OrderStatus
from app.models.order_item import OrderItem
from app.models.otp import OTPVerification
from app.models.payment import Payment, PaymentMethod, PaymentStatus
from app.models.refreshtoken import RefreshToken
from app.models.review import Review
from app.models.user import User, UserRole, UserStatus

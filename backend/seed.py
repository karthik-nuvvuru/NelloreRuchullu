"""Database seed script for development/testing using raw SQL (avoids ORM enum issues)."""
import asyncio
import uuid
import bcrypt
from datetime import datetime, timezone, timedelta

from app.database import async_session_factory, engine, get_db


def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")


async def seed():
    async with engine.begin() as conn:
        # Clear existing data
        for table in [
            "order_items", "orders", "cart_items", "carts",
            "payments", "deliveries", "reviews",
            "refresh_tokens", "addresses", "users",
            "menu_items", "categories", "coupons", "otp_verifications",
        ]:
            await conn.execute(f'DELETE FROM "{table}"')

    now = datetime.now(timezone.utc)
    valid_until = (now + timedelta(days=365)).strftime("%Y-%m-%d %H:%M:%S+00")

    admin_id = uuid.uuid4()
    vendor_id = uuid.uuid4()
    c1, c2, c3 = uuid.uuid4(), uuid.uuid4(), uuid.uuid4()
    d1, d2 = uuid.uuid4(), uuid.uuid4()

    hashed_admin = hash_password("Admin@123")
    hashed_vendor = hash_password("Vendor@123")
    hashed_customer = hash_password("Customer@123")
    hashed_delivery = hash_password("Delivery@123")

    async with async_session_factory() as session:
        await session.execute(f"""
            INSERT INTO users (id, email, phone, password_hash, first_name, last_name, role, status, is_verified, created_at, updated_at)
            VALUES
                ('{admin_id}', 'admin@nellore.com', '+919876543210', '{hashed_admin}', 'Admin', 'User', 'admin', 'active', true, now(), now()),
                ('{vendor_id}', 'vendor@nellore.com', '+919876543211', '{hashed_vendor}', 'Nellore', 'Kitchen', 'vendor', 'active', true, now(), now()),
                ('{c1}', 'customer1@test.com', '+91900000001', '{hashed_customer}', 'Customer', '1', 'customer', 'active', true, now(), now()),
                ('{c2}', 'customer2@test.com', '+91900000002', '{hashed_customer}', 'Customer', '2', 'customer', 'active', true, now(), now()),
                ('{c3}', 'customer3@test.com', '+91900000003', '{hashed_customer}', 'Customer', '3', 'customer', 'active', true, now(), now()),
                ('{d1}', 'delivery1@test.com', '+91800000001', '{hashed_delivery}', 'Driver', '1', 'delivery', 'active', true, now(), now()),
                ('{d2}', 'delivery2@test.com', '+91800000002', '{hashed_delivery}', 'Driver', '2', 'delivery', 'active', true, now(), now())
        """)

        cat1, cat2, cat3, cat4, cat5, cat6 = uuid.uuid4(), uuid.uuid4(), uuid.uuid4(), uuid.uuid4(), uuid.uuid4(), uuid.uuid4()
        await session.execute(f"""
            INSERT INTO categories (id, name, description, sort_order, is_active, created_at, updated_at)
            VALUES
                ('{cat1}', 'Biryani', 'Authentic dum biryanis', 1, true, now(), now()),
                ('{cat2}', 'Starters', 'Crispy appetizers', 2, true, now(), now()),
                ('{cat3}', 'Main Course', 'Traditional curries', 3, true, now(), now()),
                ('{cat4}', 'Rice Noodles', 'Rice varieties', 4, true, now(), now()),
                ('{cat5}', 'Desserts', 'Sweet treats', 5, true, now(), now()),
                ('{cat6}', 'Beverages', 'Cool drinks', 6, true, now(), now())
        """)

        items = [
            (uuid.uuid4(), cat1, "Chicken Dum Biryani", "Traditional hyderabadi style", "Slow-cooked chicken dum biryani with aromatic basmati rice and authentic spices", 280.00, False, True),
            (uuid.uuid4(), cat1, "Mutton Biryani", "Spicy and flavorful", "Tender goat meat marinated overnight, slow-cooked with basmati rice", 320.00, False, True),
            (uuid.uuid4(), cat2, "Chicken 65", "Spicy deep fried classic", "Crispy fried chicken with our signature Nellore spice blend", 180.00, False, True),
            (uuid.uuid4(), cat2, "Apollo Fish", "Nellore specialty", "Famous Nellore-style fish fry with tangy spice coating", 220.00, False, True),
            (uuid.uuid4(), cat2, "Paneer Tikka", "Tandoor grilled cottage cheese", "Marinated paneer grilled in tandoor with bell peppers", 190.00, True, True),
            (uuid.uuid4(), cat3, "Butter Chicken", "Rich creamy tomato", "Tender chicken in rich, creamy tomato-based gravy with butter", 240.00, False, True),
            (uuid.uuid4(), cat3, "Gongura Mutton", "Andhra specialty", "Tender goat cooked with tangy gongura sorrel leaves", 300.00, False, True),
            (uuid.uuid4(), cat3, "Veg Curry", "Mixed vegetables", "Fresh seasonal vegetables in aromatic curry sauce", 150.00, True, True),
            (uuid.uuid4(), cat4, "Veg Biryani", "Mixed veg dum biryani", "Mixed vegetable biryani with aromatic spices and saffron", 200.00, True, True),
            (uuid.uuid4(), cat4, "Curd Rice", "Cooling comfort food", "Tempered curd rice with pomegranate and cashews", 120.00, True, True),
            (uuid.uuid4(), cat5, "Double Ka Meetha", "Hyderabadi bread pudding", "Traditional Hyderabadi dessert with fried bread in sweet milk", 100.00, True, True),
            (uuid.uuid4(), cat5, "Gulab Jamun", "Soft milk dumplings", "Soft, syrup-soaked milk dumplings served warm", 80.00, True, True),
            (uuid.uuid4(), cat6, "Mango Lassi", "Sweet mango yogurt", "Thick, creamy mango yogurt drink", 60.00, True, True),
            (uuid.uuid4(), cat6, "Masala Chai", "Spiced Indian tea", "Hot spiced tea with cardamom, ginger, and cloves", 40.00, True, True),
            (uuid.uuid4(), cat4, "Egg Fried Rice", "Wok-tossed egg rice", "Classic wok-tossed egg fried rice with green onions", 160.00, False, True),
            (uuid.uuid4(), cat2, "Prawn Fry", "Nellore coastal style", "Fresh prawns fried with Nellore coastal spices and curry leaves", 280.00, False, True),
            (uuid.uuid4(), cat1, "Egg Biryani", "Boiled egg special", "Spiced egg biryani with aromatic basmati rice and special masala", 180.00, False, True),
            (uuid.uuid4(), cat3, "Chicken Curry Nellore Style", "Authentic Nellore", "Country chicken curry cooked the traditional Nellore way", 260.00, False, True),
        ]

        for item in items:
            iid, cat_id, name, short_desc, desc, price, veg, avail = item
            await session.execute(f"""
                INSERT INTO menu_items (id, category_id, name, short_description, description, price, veg, is_available, created_at, updated_at)
                VALUES ('{iid}', '{cat_id}', '{name}', '{short_desc}', '{desc}', {price:.2f}, {'true' if veg else 'false'}, {'true' if avail else 'false'}, now(), now())
            """)

        await session.execute(f"""
            INSERT INTO coupons (code, discount_percentage, discount_amount, max_discount, min_order_amount, is_active, is_first_order_only, valid_from, valid_until, usage_limit, used_count, created_at, updated_at)
            VALUES
                ('WELCOME20', 20.0, NULL, 150.00, 300.00, true, true, now(), '{valid_until}', NULL, 0, now(), now()),
                ('FLAT50', NULL, 50.00, NULL, 500.00, true, false, now(), '{valid_until}', NULL, 0, now(), now())
        """)

        await session.commit()
        print("Database seeded successfully!")
        print("  Users: 7 (admin, vendor, 3 customers, 2 delivery)")
        print("  Categories: 6")
        print("  Menu Items: 18")
        print("  Coupons: 2")
        print("  Admin: admin@nellore.com / Admin@123")


if __name__ == "__main__":
    asyncio.run(seed())

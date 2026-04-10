"""Seed database with sample data for testing."""
import asyncio
import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from passlib.context import CryptContext

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session_factory
from app.models.user import User, UserRole, UserStatus
from app.models.category import Category
from app.models.menu_item import MenuItem

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def seed_database():
    """Seed the database with test data."""
    async with async_session_factory() as db:
        # Check if already seeded
        result = await db.execute(select(User).where(User.email == "testuser@example.com"))
        if result.scalar_one_or_none():
            print("Database already seeded, skipping...")
            return

        # Create test users
        test_users = [
            {
                "email": "testuser@example.com",
                "phone": "+919988776655",
                "password_hash": pwd_context.hash("password123"),
                "first_name": "Test",
                "last_name": "User",
                "role": UserRole.CUSTOMER,
                "status": UserStatus.ACTIVE,
                "is_verified": True,
            },
            {
                "email": "admin@example.com",
                "phone": "+919988776656",
                "password_hash": pwd_context.hash("adminpass123"),
                "first_name": "Admin",
                "last_name": "User",
                "role": UserRole.ADMIN,
                "status": UserStatus.ACTIVE,
                "is_verified": True,
            },
            {
                "email": "vendor@example.com",
                "phone": "+919988776657",
                "password_hash": pwd_context.hash("vendorpass123"),
                "first_name": "Vendor",
                "last_name": "User",
                "role": UserRole.VENDOR,
                "status": UserStatus.ACTIVE,
                "is_verified": True,
            },
            {
                "email": "delivery1@example.com",
                "phone": "+919988776658",
                "password_hash": pwd_context.hash("deliverypass123"),
                "first_name": "Delivery",
                "last_name": "Partner 1",
                "role": UserRole.DELIVERY,
                "status": UserStatus.ACTIVE,
                "is_verified": True,
            },
            {
                "email": "delivery2@example.com",
                "phone": "+919988776659",
                "password_hash": pwd_context.hash("deliverypass123"),
                "first_name": "Delivery",
                "last_name": "Partner 2",
                "role": UserRole.DELIVERY,
                "status": UserStatus.ACTIVE,
                "is_verified": True,
            },
        ]

        created_users = []
        for user_data in test_users:
            user = User(**user_data)
            db.add(user)
            created_users.append(user)

        # Create categories
        categories_data = [
            {"name": "Starters", "description": "Appetizers and starters", "image_url": "https://images.unsplash.com/photo-1541529086526-db283c563270?w=400", "sort_order": 1},
            {"name": "Main Course", "description": "Traditional Nellore main dishes", "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400", "sort_order": 2},
            {"name": "Biryani", "description": "Flavorful rice dishes", "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400", "sort_order": 3},
            {"name": "Vegetarian", "description": "Pure vegetarian delights", "image_url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400", "sort_order": 4},
            {"name": "Desserts", "description": "Sweet endings", "image_url": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400", "sort_order": 5},
            {"name": "Beverages", "description": "Refreshing drinks", "image_url": "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400", "sort_order": 6},
        ]

        created_categories = []
        for cat_data in categories_data:
            category = Category(**cat_data)
            db.add(category)
            created_categories.append(category)

        await db.flush()

        # Create menu items with real Unsplash images
        menu_items_data = [
            # Starters
            {"category_id": created_categories[0].id, "name": "Chicken 65", "description": "Spicy deep-fried chicken", "price": Decimal("249.00"), "image_url": "https://images.unsplash.com/photo-1628563694463-97744c6daba7?w=400", "is_vegetarian": False, "is_available": True, "preparation_time_minutes": 20},
            {"category_id": created_categories[0].id, "name": "Gobi Manchurian", "description": "Crispy cauliflower in spicy sauce", "price": Decimal("179.00"), "image_url": "https://images.unsplash.com/photo-1645177628172-a94c1fde7b8b?w=400", "is_vegetarian": True, "is_available": True, "preparation_time_minutes": 15},
            {"category_id": created_categories[0].id, "name": "Prawn Fry", "description": "Spiced grilled prawns", "price": Decimal("349.00"), "image_url": "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400", "is_vegetarian": False, "is_available": True, "preparation_time_minutes": 25},
            {"category_id": created_categories[0].id, "name": "Mirchi Bajji", "description": "Stuffed pepper fritters", "price": Decimal("129.00"), "image_url": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400", "is_vegetarian": True, "is_available": True, "preparation_time_minutes": 15},

            # Main Course
            {"category_id": created_categories[1].id, "name": "Nellore Chicken Curry", "description": "Traditional spicy chicken curry", "price": Decimal("299.00"), "image_url": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400", "is_vegetarian": False, "is_available": True, "preparation_time_minutes": 35},
            {"category_id": created_categories[1].id, "name": "Kunda Curry", "description": "Spiced meat curry with rich gravy", "price": Decimal("349.00"), "image_url": "https://images.unsplash.com/photo-1603496987351-f84a3ba5ec98?w=400", "is_vegetarian": False, "is_available": True, "preparation_time_minutes": 40},
            {"category_id": created_categories[1].id, "name": "Gongura Chicken", "description": "Chicken with sorrel leaves", "price": Decimal("329.00"), "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400", "is_vegetarian": False, "is_available": True, "preparation_time_minutes": 30},
            {"category_id": created_categories[1].id, "name": "Pulusu", "description": "Tamarind-based vegetable stew", "price": Decimal("199.00"), "image_url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400", "is_vegetarian": True, "is_available": True, "preparation_time_minutes": 25},

            # Biryani
            {"category_id": created_categories[2].id, "name": "Chicken Biryani", "description": "Aromatic rice with spiced chicken", "price": Decimal("399.00"), "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400", "is_vegetarian": False, "is_available": True, "preparation_time_minutes": 45},
            {"category_id": created_categories[2].id, "name": "Mutton Biryani", "description": "Premium mutton layered rice", "price": Decimal("499.00"), "image_url": "https://images.unsplash.com/photo-1589302168068-9647543b23e8?w=400", "is_vegetarian": False, "is_available": True, "preparation_time_minutes": 50},
            {"category_id": created_categories[2].id, "name": "Prawn Biryani", "description": "Flavorful prawn biryani", "price": Decimal("549.00"), "image_url": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400", "is_vegetarian": False, "is_available": True, "preparation_time_minutes": 45},
            {"category_id": created_categories[2].id, "name": "Veg Biryani", "description": "Fragrant vegetable biryani", "price": Decimal("279.00"), "image_url": "https://images.unsplash.com/photo-1645177628172-a94c1fde7b8b?w=400", "is_vegetarian": True, "is_available": True, "preparation_time_minutes": 35},

            # Vegetarian
            {"category_id": created_categories[3].id, "name": "Paneer Butter Masala", "description": "Creamy paneer in tomato gravy", "price": Decimal("249.00"), "image_url": "https://images.unsplash.com/photo-1604908177451-4986d5a9c28f?w=400", "is_vegetarian": True, "is_available": True, "preparation_time_minutes": 30},
            {"category_id": created_categories[3].id, "name": "Dal Tadka", "description": "Spiced lentil preparation", "price": Decimal("159.00"), "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400", "is_vegetarian": True, "is_available": True, "preparation_time_minutes": 20},
            {"category_id": created_categories[3].id, "name": "Chettinad Vegetables", "description": "Spicy mixed vegetable curry", "price": Decimal("199.00"), "image_url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400", "is_vegetarian": True, "is_available": True, "preparation_time_minutes": 25},
            {"category_id": created_categories[3].id, "name": "Malai Kofta", "description": "Creamy paneer dumplings", "price": Decimal("229.00"), "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400", "is_vegetarian": True, "is_available": True, "preparation_time_minutes": 35},

            # Desserts
            {"category_id": created_categories[4].id, "name": "Gulab Jamun", "description": "Sweet milk dumplings in syrup", "price": Decimal("99.00"), "image_url": "https://images.unsplash.com/photo-1666190077589-3dbb499e5b62?w=400", "is_vegetarian": True, "is_available": True, "preparation_time_minutes": 15},
            {"category_id": created_categories[4].id, "name": "Rasmalai", "description": "Soft cheese in sweet milk", "price": Decimal("129.00"), "image_url": "https://images.unsplash.com/photo-1571006682378-760086a5e1b6?w=400", "is_vegetarian": True, "is_available": True, "preparation_time_minutes": 20},
            {"category_id": created_categories[4].id, "name": "Kheer", "description": "Traditional rice pudding", "price": Decimal("99.00"), "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400", "is_vegetarian": True, "is_available": True, "preparation_time_minutes": 25},
            {"category_id": created_categories[4].id, "name": "Jhangri", "description": "Nellore special sweet", "price": Decimal("149.00"), "image_url": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400", "is_vegetarian": True, "is_available": True, "preparation_time_minutes": 30},

            # Beverages
            {"category_id": created_categories[5].id, "name": "Mango Lassi", "description": "Sweet yogurt mango drink", "price": Decimal("79.00"), "image_url": "https://images.unsplash.com/photo-1527661591475-527312dd1f9a?w=400", "is_vegetarian": True, "is_available": True, "preparation_time_minutes": 5},
            {"category_id": created_categories[5].id, "name": "Masala Chai", "description": "Spiced Indian tea", "price": Decimal("49.00"), "image_url": "https://images.unsplash.com/photo-1571934811356-5cc061b82f33?w=400", "is_vegetarian": True, "is_available": True, "preparation_time_minutes": 5},
            {"category_id": created_categories[5].id, "name": "Fresh Lime Soda", "description": "Refreshing lime with soda", "price": Decimal("59.00"), "image_url": "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400", "is_vegetarian": True, "is_available": True, "preparation_time_minutes": 3},
            {"category_id": created_categories[5].id, "name": "Badam Milk", "description": "Almond flavored milk", "price": Decimal("89.00"), "image_url": "https://images.unsplash.com/photo-1574914629385-46448b767a1d?w=400", "is_vegetarian": True, "is_available": True, "preparation_time_minutes": 5},
        ]

        for item_data in menu_items_data:
            menu_item = MenuItem(**item_data)
            db.add(menu_item)

        await db.commit()
        print("✓ Database seeded successfully!")
        print(f"  - Created {len(test_users)} users (including 2 delivery partners)")
        print(f"  - Created {len(categories_data)} categories")
        print(f"  - Created {len(menu_items_data)} menu items")


if __name__ == "__main__":
    asyncio.run(seed_database())

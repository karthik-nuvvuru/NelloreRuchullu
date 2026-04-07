#!/usr/bin/env python3
"""Seed the database with sample menu data for testing."""

import asyncio
import sys
from uuid import uuid4

sys.path.insert(0, '/app')

from app.database import async_session_factory, init_db
from app.models.category import Category
from app.models.menu_item import MenuItem


CATEGORIES = [
    {
        "name": "Starters",
        "description": "Appetizers and small bites",
        "image_url": "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400",
        "sort_order": 1,
    },
    {
        "name": "Biryani",
        "description": "Signature rice dishes",
        "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400",
        "sort_order": 2,
    },
    {
        "name": "Curries",
        "description": "Curry dishes with rice or bread",
        "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400",
        "sort_order": 3,
    },
    {
        "name": "Tandoor",
        "description": "Tandoori baked dishes",
        "image_url": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400",
        "sort_order": 4,
    },
    {
        "name": "Desserts",
        "description": "Sweet treats",
        "image_url": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400",
        "sort_order": 5,
    },
    {
        "name": "Beverages",
        "description": "Drinks and refreshments",
        "image_url": "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400",
        "sort_order": 6,
    },
]

MENU_ITEMS = [
    # Starters
    {"name": "Chicken 65", "description": "Spicy deep-fried chicken", "price": 249, "category": "Starters", "is_vegetarian": False, "image_url": "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=400", "stock": 50},
    {"name": "Paneer Tikka", "description": "Grilled cottage cheese cubes", "price": 199, "category": "Starters", "is_vegetarian": True, "image_url": "https://images.unsplash.com/photo-1567188040759-fb8a8839b2d8?w=400", "stock": 40},
    {"name": "Gobi Manchurian", "description": "Crispy cauliflower in spicy sauce", "price": 149, "category": "Starters", "is_vegetarian": True, "image_url": "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=400", "stock": 35},
    {"name": "Lamb Samosa", "description": "Crispy pastry with spiced lamb filling", "price": 179, "category": "Starters", "is_vegetarian": False, "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400", "stock": 30},
    {"name": "Veg Samosa", "description": "Crispy pastry with spiced potato filling", "price": 99, "category": "Starters", "is_vegetarian": True, "image_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400", "stock": 50},

    # Biryani
    {"name": "Chicken Dum Biryani", "description": "Aromatic rice with tender chicken, slow cooked", "price": 299, "category": "Biryani", "is_vegetarian": False, "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400", "stock": 40},
    {"name": "Mutton Biryani", "description": "Premium mutton with fragrant rice", "price": 399, "category": "Biryani", "is_vegetarian": False, "image_url": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400", "stock": 25},
    {"name": "Prawn Biryani", "description": "Fresh prawns with aromatic rice", "price": 449, "category": "Biryani", "is_vegetarian": False, "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400", "stock": 20},
    {"name": "Veg Biryani", "description": "Garden fresh vegetables with basmati rice", "price": 199, "category": "Biryani", "is_vegetarian": True, "image_url": "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=400", "stock": 35},
    {"name": "Egg Biryani", "description": "Classic egg biryani with aromatic spices", "price": 229, "category": "Biryani", "is_vegetarian": False, "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400", "stock": 30},

    # Curries
    {"name": "Butter Chicken", "description": "Creamy tomato curry with tender chicken", "price": 279, "category": "Curries", "is_vegetarian": False, "image_url": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400", "stock": 40},
    {"name": "Nellore Chicken Curry", "description": "Authentic Nellore style spicy chicken curry", "price": 259, "category": "Curries", "is_vegetarian": False, "image_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400", "stock": 35},
    {"name": "Mutton Rogan Josh", "description": "Kashmiri style slow cooked mutton", "price": 349, "category": "Curries", "is_vegetarian": False, "image_url": "https://images.unsplash.com/photo-1545247181-516773cae754?w=400", "stock": 25},
    {"name": "Paneer Butter Masala", "description": "Creamy paneer in rich tomato gravy", "price": 199, "category": "Curries", "is_vegetarian": True, "image_url": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400", "stock": 40},
    {"name": "Dal Makhani", "description": "Creamy slow-cooked black lentils", "price": 179, "category": "Curries", "is_vegetarian": True, "image_url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400", "stock": 50},
    {"name": "Kadai Paneer", "description": "Paneer cooked with bell peppers in kadai masala", "price": 209, "category": "Curries", "is_vegetarian": True, "image_url": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400", "stock": 35},

    # Tandoor
    {"name": "Chicken Tikka", "description": "Tandoori grilled chicken pieces", "price": 289, "category": "Tandoor", "is_vegetarian": False, "image_url": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400", "stock": 35},
    {"name": "Tandoori Chicken Half", "description": "Full flavored tandoori chicken (half)", "price": 249, "category": "Tandoor", "is_vegetarian": False, "image_url": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400", "stock": 30},
    {"name": "Seekh Kebab", "description": "Minced lamb kebabs from the tandoor", "price": 299, "category": "Tandoor", "is_vegetarian": False, "image_url": "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400", "stock": 25},
    {"name": "Naan (Butter)", "description": "Soft leavened bread brushed with butter", "price": 49, "category": "Tandoor", "is_vegetarian": True, "image_url": "https://images.unsplash.com/photo-1596560548464-f010b8e34782?w=400", "stock": 100},
    {"name": "Garlic Naan", "description": "Naan topped with garlic and butter", "price": 59, "category": "Tandoor", "is_vegetarian": True, "image_url": "https://images.unsplash.com/photo-1596560548464-f010b8e34782?w=400", "stock": 100},
    {"name": "Tandoori Roti", "description": "Whole wheat flatbread from tandoor", "price": 29, "category": "Tandoor", "is_vegetarian": True, "image_url": "https://images.unsplash.com/photo-1596560548464-f010b8e34782?w=400", "stock": 100},

    # Desserts
    {"name": "Gulab Jamun (2pc)", "description": "Deep-fried milk balls in sugar syrup", "price": 79, "category": "Desserts", "is_vegetarian": True, "image_url": "https://images.unsplash.com/photo-1666190094745-d7505329e8bc?w=400", "stock": 50},
    {"name": "Rasmalai (2pc)", "description": "Soft cottage cheese dumplings in milk", "price": 99, "category": "Desserts", "is_vegetarian": True, "image_url": "https://images.unsplash.com/photo-1571006682359-07895345efc3?w=400", "stock": 40},
    {"name": "Kheer", "description": "Traditional rice pudding", "price": 89, "category": "Desserts", "is_vegetarian": True, "image_url": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400", "stock": 45},
    {"name": "Ice Cream (2 scoops)", "description": "Choice of vanilla, chocolate or mango", "price": 99, "category": "Desserts", "is_vegetarian": True, "image_url": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400", "stock": 60},

    # Beverages
    {"name": "Mango Lassi", "description": "Sweet yogurt mango smoothie", "price": 89, "category": "Beverages", "is_vegetarian": True, "image_url": "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400", "stock": 50},
    {"name": "Masala Chai", "description": "Traditional spiced Indian tea", "price": 39, "category": "Beverages", "is_vegetarian": True, "image_url": "https://images.unsplash.com/photo-1544787219-7f47ccb56174?w=400", "stock": 100},
    {"name": "Sweet Lassi", "description": "Creamy sweet yogurt drink", "price": 69, "category": "Beverages", "is_vegetarian": True, "image_url": "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400", "stock": 50},
    {"name": "Cold Coffee", "description": "Iced coffee with ice cream", "price": 119, "category": "Beverages", "is_vegetarian": True, "image_url": "https://images.unsplash.com/photo-1461023058943-48db09b83b38?w=400", "stock": 40},
    {"name": "Fresh Lime Soda", "description": "Refreshing lime with soda water", "price": 49, "category": "Beverages", "is_vegetarian": True, "image_url": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400", "stock": 80},
]


async def seed_database():
    """Seed the database with categories and menu items."""
    print("Initializing database...")
    await init_db()

    async with async_session_factory() as session:
        # Check if data already exists
        from sqlalchemy import select
        result = await session.execute(select(Category))
        existing_cats = result.scalars().all()
        if existing_cats:
            print(f"Database already has {len(existing_cats)} categories. Skipping seed.")
            print("To reseed, first clear the database.")
            return

        print("Creating categories...")
        category_map = {}
        for cat_data in CATEGORIES:
            category = Category(
                id=uuid4(),
                name=cat_data["name"],
                description=cat_data.get("description"),
                image_url=cat_data.get("image_url"),
                sort_order=cat_data.get("sort_order", 0),
                is_active=True,
            )
            session.add(category)
            category_map[cat_data["name"]] = category
            print(f"  - {cat_data['name']}")

        await session.flush()

        print("Creating menu items...")
        for item_data in MENU_ITEMS:
            category_name = item_data.pop("category")
            category = category_map.get(category_name)

            item = MenuItem(
                id=uuid4(),
                category_id=category.id if category else None,
                name=item_data["name"],
                description=item_data.get("description"),
                price=item_data["price"],
                image_url=item_data.get("image_url"),
                is_vegetarian=item_data.get("is_vegetarian", False),
                is_available=True,
                stock=item_data.get("stock", 100),
            )
            session.add(item)
            print(f"  - {item_data['name']} ({category_name})")

        await session.commit()
        print("\n✅ Database seeded successfully!")
        print(f"   {len(CATEGORIES)} categories")
        print(f"   {len(MENU_ITEMS)} menu items")


if __name__ == "__main__":
    asyncio.run(seed_database())

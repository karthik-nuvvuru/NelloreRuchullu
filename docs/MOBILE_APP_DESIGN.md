# NelloreRuchullu Mobile App - Design Specification
## Cloud Kitchen Food Delivery App (Swiggy/Zomato Style)

---

## 1. DESIGN TOKENS

### Color Palette
```json
{
  "colors": {
    "primary": {
      "50": "#FFF1EC",
      "100": "#FFE0D1",
      "200": "#FFC3A6",
      "300": "#FF9B6A",
      "400": "#FF7A3D",
      "500": "#FF6B35",  // Main brand orange
      "600": "#E85A2A",
      "700": "#CC4921",
      "800": "#B33818",
      "900": "#992710"
    },
    "secondary": {
      "dark": "#1E1E1E",
      "light": "#FFFFFF",
      "gray": {
        "50": "#F9FAFB",
        "100": "#F3F4F6",
        "200": "#E5E7EB",
        "300": "#D1D5DB",
        "400": "#9CA3AF",
        "500": "#6B7280",
        "600": "#4B5563",
        "700": "#374151",
        "800": "#1F2937",
        "900": "#111827"
      }
    },
    "success": "#4CAF50",
    "warning": "#FFC107",
    "error": "#EF4444",
    "info": "#3B82F6"
  }
}
```

### Typography (Inter/SF Pro)
```json
{
  "typography": {
    "fontFamily": {
      "primary": "Inter",
      "ios": "-apple-system, SF Pro Display",
      "android": "Roboto"
    },
    "fontSize": {
      "xs": "12px",
      "sm": "14px",
      "base": "16px",
      "lg": "18px",
      "xl": "20px",
      "2xl": "24px",
      "3xl": "28px",
      "4xl": "32px",
      "5xl": "40px"
    },
    "fontWeight": {
      "regular": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    },
    "lineHeight": {
      "tight": 1.2,
      "normal": 1.5,
      "relaxed": 1.75
    }
  },
  "heading": {
    "h1": { "fontSize": "32px", "fontWeight": 700, "lineHeight": 1.2 },
    "h2": { "fontSize": "28px", "fontWeight": 700, "lineHeight": 1.2 },
    "h3": { "fontSize": "24px", "fontWeight": 600, "lineHeight": 1.3 },
    "h4": { "fontSize": "20px", "fontWeight": 600, "lineHeight": 1.3 },
    "h5": { "fontSize": "18px", "fontWeight": 600, "lineHeight": 1.4 }
  },
  "body": {
    "large": { "fontSize": "18px", "fontWeight": 400, "lineHeight": 1.5 },
    "regular": { "fontSize": "16px", "fontWeight": 400, "lineHeight": 1.5 },
    "small": { "fontSize": "14px", "fontWeight": 400, "lineHeight": 1.5 }
  }
}
```

### Spacing System (8pt Grid)
```json
{
  "spacing": {
    "0": "0px",
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "5": "20px",
    "6": "24px",
    "8": "32px",
    "10": "40px",
    "12": "48px",
    "16": "64px",
    "20": "80px",
    "24": "96px"
  },
  "borderRadius": {
    "none": "0px",
    "sm": "4px",
    "md": "8px",
    "lg": "12px",
    "xl": "16px",
    "2xl": "24px",
    "full": "9999px"
  },
  "gutters": "16px",
  "gaps": "8px"
}
```

### Shadows (Neumorphic)
```json
{
  "shadows": {
    "sm": "0px 1px 2px rgba(0, 0, 0, 0.05)",
    "md": "0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)",
    "lg": "0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)",
    "xl": "0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "innerLight": "inset 2px 2px 5px rgba(255, 255, 255, 0.3), inset -2px -2px 5px rgba(0, 0, 0, 0.1)",
    "card": "0px 2px 8px rgba(0, 0, 0, 0.08)",
    "elevated": "0px 8px 24px rgba(0, 0, 0, 0.12)"
  }
}
```

---

## 2. ACCESSIBILITY
- Minimum contrast ratio: 4.5:1 (WCAG AA)
- Touch targets: minimum 44x44px
- ARIA labels on all interactive elements
- VoiceOver/TalkBack support
- Reduced motion support

---

## 3. SCREEN SPECIFICATIONS (15+ Screens)

### Screen 1: Splash Screen
```
┌─────────────────────────────┐
│                             │
│         🍛                  │  <- Animated logo
│     NELLORE RUCHULLU        │
│                             │
│    ████████░░░░ 75%         │  <- Loading bar
│                             │
└─────────────────────────────┘
Background: Gradient #FF6B35 → #FF8C5A
Duration: 2 seconds
Animation: Logo scale 0.8→1.0, opacity 0→1
```

### Screen 2: Onboarding (3 slides)
```
Slide 1:
┌─────────────────────────────┐
│    [Skip]            1/3    │
│                             │
│     🍛🍛🍛                   │  <- Hero illustration
│                             │
│   "Authentic Nellore        │
│    Cuisine Delivered        │
│    to Your Door"            │
│                             │
│        ● ○ ○                │
│                             │
│       [Next →]              │
└─────────────────────────────┘

Slide 2:
┌─────────────────────────────┐
│    [Skip]            2/3    │
│                             │
│     🚀                      │
│                             │
│   "Track Your Order         │
│    in Real-Time"            │
│                             │
│        ○ ● ○                │
│                             │
│   [← Back]  [Next →]        │
└─────────────────────────────┘

Slide 3:
┌─────────────────────────────┐
│    [Skip]            3/3    │
│                             │
│     💳                      │
│                             │
│   "Secure & Easy            │
│    Payments"                │
│                             │
│        ○ ○ ●                │
│                             │
│   [← Back]  [Get Started]   │
└─────────────────────────────┘
```

### Screen 3: Login/Register
```
┌─────────────────────────────┐
│  ←                    [Skip]│
│                             │
│   Welcome Back! 👋          │
│                             │
│   ┌─────────────────────┐   │
│   │ 📱 +91 | __________ │   │  <- Phone input
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │ 🔐 Enter OTP      ▼ │   │  <- OTP sent
│   └─────────────────────┘   │
│                             │
│   [Send OTP]                │  <- Primary button
│                             │
│   ─────── OR ───────        │
│                             │
│   ┌─────────────────────┐   │
│   │  Continue with      │   │  <- Google
│   │  Google         G   │   │
│   └─────────────────────┘   │
│                             │
│   Don't have account?       │
│   [Create Account]           │
│                             │
└─────────────────────────────┘
```

### Screen 4: Home Feed
```
┌─────────────────────────────┐
│  ←  NelloreRuchullu    🔔   │  <- Header
├─────────────────────────────┤
│  📍 Koramanpally, Nellore ▼ │  <- Location
├─────────────────────────────┤
│  ┌─────────────────────┐   │
│  │ 🔍 Search restaurants│   │  <- Search bar
│  └─────────────────────┘   │
├─────────────────────────────┤
│  🎯 OFFERS FOR YOU          │
│  ┌──────┐ ┌──────┐ ┌──────┐ │
│  │ 50%  │ │ FREE │ │ 30%  │ │  <- Horizontal scroll
│  │ OFF  │ │DELIV │ │ OFF  │ │
│  └──────┘ └──────┘ └──────┘ │
├─────────────────────────────┤
│  🍛 TOP PICKS                │
│  ┌─────────────────────────┐│
│  │ [Hero Food Image]        ││  <- Large card
│  │ Chicken Biryani          ││
│  │ ⭐ 4.5 (1.2k)  💰₹349    ││
│  │ [ADD +]                  ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  📋 CATEGORIES               │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐│
│  │ 🍗 │ │ 🍚 │ │ 🥗 │ │ 🍰 ││  <- Horizontal scroll
│  │Biry│ │Main│ │Veg │ │Sweets│
│  └────┘ └────┘ └────┘ └────┘│
├─────────────────────────────┤
│  🏪 RESTAURANTS NEAR YOU     │
│  ┌─────────────────────────┐│
│  │ [Img] Nellore Kitchen   ││
│  │    ⭐ 4.2  • 35 mins    ││
│  │         💰₹200/min      ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ [Img] Spice Garden      ││
│  │    ⭐ 4.6  • 40 mins    ││
│  │         💰₹180/min      ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  🛒  │  🔍  │  📋  │  👤   │  <- Bottom nav
└─────────────────────────────┘
```

### Screen 5: Search & Filter
```
┌─────────────────────────────┐
│  ←  [Recent Searches]  [X] │
├─────────────────────────────┤
│  ┌─────────────────────┐   │
│  │ 🔍 Biryani           │   │
│  └─────────────────────┘   │
├─────────────────────────────┤
│  Recent          Clear all │
│  ┌────────┐ ┌────────┐      │
│  │Biryani │ │Chicken │      │
│  └────────┘ └────────┘      │
├─────────────────────────────┤
│  Trending                   │
│  ┌────────┐ ┌────────┐      │
│  │Paneer  │ │Nellore │      │
│  └────────┘ └────────┘      │
├─────────────────────────────┤
│  ┌─────────────────────┐   │
│  │   Apply Filters (4)  │   │
│  │   [Price] [Rating]   │   │
│  │   [Cuisine] [Diet]  │   │
│  └─────────────────────┘   │
│                             │
│  Price Range               │
│  ○ Under ₹200              │
│  ○ ₹200 - ₹500             │
│  ●₹500+                     │
│                             │
│  Rating                     │
│  ● 4+ ⭐                    │
│  ○ 3+ ⭐                    │
│                             │
│  Cuisine                    │
│  [Vegetarian] [Biryani]     │
│  [South Indian] [Fast Food] │
│                             │
│  [Apply Filters] [Clear]    │
└─────────────────────────────┘
```

### Screen 6: Restaurant Menu
```
┌─────────────────────────────┐
│  ←        🔍       🔔   ⋮   │
├─────────────────────────────┤
│  [Hero Image - Parallax]     │
│  ┌─────────────────────────┐│
│  │ Nellore Kitchen 👑      ││
│  │ ⭐ 4.5 (1.2k) • 35 mins ││
│  │ 🍽️ Chinese • North Indian││
│  │ 📍 Koramanpally         ││
│  │ 🎁 Use code NRCHULLU     ││
│  │   Flat 30% OFF          ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  [Search in menu...]        │
├─────────────────────────────┤
│  Quick Select              │
│  [Starters][Biryani][Mains] │
│  [Bread][Rice][Desserts]    │
│  [Beverages]                │
├─────────────────────────────┤
│  ★ STARTERS (12)           │
│  ┌─────────────────────────┐│
│  │ [Img] Chicken 65       ││
│  │ Spicy fried chicken    ││
│  │ ⭐ 4.5  💰₹249         ││
│  │              [ADD +]   ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ [Img] Gobi Manchurian   ││
│  │ Crispy cauliflower     ││
│  │ ⭐ 4.3  💰₹179         ││
│  │              [ADD +]   ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  ★ BIRYANI (8)             │
│  ┌─────────────────────────┐│
│  │ [Img] Chicken Biryani   ││
│  │ Aromatic rice dish      ││
│  │ ⭐ 4.7  💰₹399         ││
│  │         [-  1  +]       ││  <- Quantity controls
│  └─────────────────────────┘│
├─────────────────────────────┤
│                          💰₹ │
│  ┌─────────────────────────┐│  <- Sticky cart
│  │  🛒 2 items • ₹628      ││
│  │      [View Cart →]      ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

### Screen 7: Cart
```
┌─────────────────────────────┐
│  ←      Your Cart    [🗑️] │
├─────────────────────────────┤
│  🏪 Nellore Kitchen         │
│  ┌─────────────────────────┐│
│  │ [Img] Chicken Biryani ×1 ││
│  │     💰₹399    [-][+]    ││
│  │ Spice level: Medium     ││
│  │ [Edit] [Remove]         ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ [Img] Chicken 65 ×2     ││
│  │     💰₹498    [-][+]    ││
│  │ [Edit] [Remove]         ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  ┌─────────────────────────┐│
│  │ 🎫 Apply Coupon         ││
│  │ [Enter code...] [Apply] ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  Bill Details              │
│  ─────────────────────────  │
│  Item Total       ₹897     │
│  Delivery Fee     ₹40      │
│  Packaging Fee    ₹10      │
│  GST (5%)         ₹47      │
│  ─────────────────────────  │
│  Grand Total      ₹994     │
├─────────────────────────────┤
│  ┌─────────────────────────┐│
│  │  🎁 NRCHULLU applied    ││
│  │  You save ₹269!          ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  Delivery Instructions      │
│  [No contact delivery ▼]   │
├─────────────────────────────┤
│  ┌─────────────────────────┐│
│  │    🛒  Proceed to        ││
│  │    Checkout     ₹994 →  ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

### Screen 8: Checkout/Address
```
┌─────────────────────────────┐
│  ←      Checkout           │
├─────────────────────────────┤
│  Deliver To                 │
│  ┌─────────────────────────┐│
│  │ 🏠 Home                  ││
│  │ 123 Food Street,         ││
│  │ Koramanpally, Nellore     ││
│  │ Andhara Pradesh 524002  ││
│  │ [Change]                ││
│  └─────────────────────────┘│
│                             │
│  + Add New Address          │
├─────────────────────────────┤
│  ⏰ Delivery Time           │
│  ○ ASAP (35-40 mins)        │
│  ● Schedule for later       │
│  ┌─────────────────────────┐│
│  │ Select Date & Time     ││
│  │ [Today 7:30 PM ▼]      ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  Payment                   │
│  ┌─────────────────────────┐│
│  │ 💳 Credit/Debit Card    ││
│  │ ○ HDFC •••• 4532        ││
│  │ ○ ICICI •••• 8765       ││
│  │ [+ Add Card]            ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ 📱 UPI                  ││
│  │ ○ Google Pay            ││
│  │ ○ PhonePe               ││
│  │ [+ Add UPI]             ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ 💵 Cash on Delivery     ││
│  │    (+₹20 charge)        ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  Order Summary             │
│  3 items • ₹994            │
├─────────────────────────────┤
│  ┌─────────────────────────┐│
│  │ [        PAY ₹994      ] ││
│  │ 🔒 Secure checkout       ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

### Screen 9: Payment (Razorpay/Stripe)
```
┌─────────────────────────────┐
│  ←         Payment          │
├─────────────────────────────┤
│  Amount to Pay              │
│         ₹994               │
│        ⏺⏺⏺⏺⏺              │
├─────────────────────────────┤
│  ┌─────────────────────────┐│
│  │ ● Credit/Debit Card     ││
│  │   Card Number            ││
│  │   ┌─────────────────┐   ││
│  │   │ 4532  ••••  ••••  │   ││
│  │   └─────────────────┘   ││
│  │   Expiry      CVV       ││
│  │   ┌────┐ ┌───┐ ┌────┐   ││
│  │   │MM/YY│ │•••│ │123│   ││
│  │   └────┘ └───┘ └────┘   ││
│  │   Cardholder Name       ││
│  │   [_______________]    ││
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │ [    Pay ₹994 Now    ]  ││
│  └─────────────────────────┘│
│                             │
│  🔒 256-bit SSL Encryption  │
│  Powered by Razorpay        │
└─────────────────────────────┘
```

### Screen 10: Order Confirmed
```
┌─────────────────────────────┐
│                             │
│         ✅                  │
│                             │
│    Order Confirmed!         │
│    #NR2024ABCD             │
│                             │
│  Estimated Delivery        │
│     7:35 PM (35 mins)      │
│                             │
├─────────────────────────────┤
│  🏠 Deliver To               │
│  Home                       │
│  123 Food Street,           │
│  Koramanpally, Nellore       │
├─────────────────────────────┤
│  Order Details              │
│  ┌─────────────────────────┐│
│  │ Chicken Biryani ×1  ₹399││
│  │ Chicken 65 ×2       ₹498││
│  │ Delivery Fee        ₹40 ││
│  │ GST                ₹47 ││
│  │ ─────────────────────── ││
│  │ Total Paid     ₹984    ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  ┌─────────────────────────┐│
│  │  [     Track Order     ]││
│  │  [  Explore More Food ]││
│  └─────────────────────────┘│
│                             │
└─────────────────────────────┘
```

### Screen 11: Order Tracking (Map)
```
┌─────────────────────────────┐
│  ←      Track Order         │
├─────────────────────────────┤
│  #NR2024ABCD               │
│  Estimated: 7:35 PM        │
├─────────────────────────────┤
│  ┌─────────────────────────┐│
│  │                         ││
│  │    📍 Restaurant        ││
│  │         ●───────────    ││  <- Live map
│  │              🚴         ││
│  │         ──────────→     ││
│  │              📍         ││
│  │           Home          ││
│  │                         ││
│  │  ┌─────────────────┐    ││
│  │  │ 🧑 Raj (Delivery │    ││
│  │  │    Partner)      │    ││
│  │  │ ⭐ 4.8 (120)     │    │
│  │  │ [📞 Call] [💬]  │    │
│  │  └─────────────────┘    ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  Status Timeline            │
│  ┌─────────────────────────┐│
│  │ ● Order Placed    7:00PM││
│  │ │ Your order confirmed  ││
│  │ ├───────────────────────││
│  │ ● Preparing       7:05PM││
│  │ │ Restaurant is         ││
│  │ │ preparing your food   ││
│  │ ├───────────────────────││
│  │ ○ Picked Up       7:30PM││
│  │ │ Driver picked up     ││
│  │ ├───────────────────────││
│  │ ○ Delivered      7:35PM ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  ┌─────────────────────────┐│
│  │ [📞 Help] [🗒️ Invoice] ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

### Screen 12: Profile
```
┌─────────────────────────────┐
│  ←              ⚙️          │
├─────────────────────────────┤
│       ┌─────────┐           │
│       │  👤    │           │  <- Avatar
│       └─────────┘           │
│   Test User                 │
│   test@email.com           │
│   +91 99887 66554          │
├─────────────────────────────┤
│  ┌─────────────────────────┐│
│  │ 👤 My Profile          →││
│  │ 📍 Addresses           →││
│  │ 💳 Payment Methods     →││
│  │ 🎫 Offers & Rewards    →││
│  │ 🔔 Notifications       →││
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │ 📋 Orders              →││
│  │ ⭐ Reviews             →││
│  │ 📝 Favourites          →││
│  │ 📞 Help & Support      →││
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │ 🌙 Dark Mode      [○━━]││  <- Toggle
│  │ 📱 App Version  1.0.0  ││
│  │ [      Logout      ]   ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

### Screen 13: Order History
```
┌─────────────────────────────┐
│  ←      My Orders          │
├─────────────────────────────┤
│  [All] [Upcoming] [Past]    │  <- Tabs
├─────────────────────────────┤
│  ┌─────────────────────────┐│
│  │ ✓ #NR2024ABCD          ││
│  │ 🏪 Nellore Kitchen     ││
│  │ 📅 Mar 15, 2024 • 7:35PM││
│  │ 🛒 3 items • ₹994      ││
│  │                          ││
│  │ ● Delivered         [→] ││
│  │ [Rate Order]            ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ ✓ #NR2024ABC9          ││
│  │ 🏪 Spice Garden        ││
│  │ 📅 Mar 10, 2024 • 8:00PM││
│  │ 🛒 2 items • ₹649      ││
│  │                          ││
│  │ ✓ Delivered         [→] ││
│  │ ⭐ Rated 4.5            ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  ┌─────────────────────────┐│
│  │ [      View All Orders   ]││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

### Screen 14: Offers & Rewards
```
┌─────────────────────────────┐
│  ←   Offers & Rewards     │
├─────────────────────────────┤
│  💰 Credits: ₹125           │
├─────────────────────────────┤
│  AVAILABLE COUPONS          │
│  ┌─────────────────────────┐│
│  │ 🎉 NRCHULLU30           ││
│  │ 30% OFF on all orders   ││
│  │ Min order: ₹500         ││
│  │ Valid till: Apr 30      ││
│  │ [Copy Code]             ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ 🎁 FREEDELIV            ││
│  │ Free delivery           ││
│  │ Min order: ₹300         ││
│  │ Valid till: Apr 15      ││
│  │ [Copy Code]             ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  STRIPE OFFERS              │
│  ┌─────────────────────────┐│
│  │ Flat 20% OFF up to ₹100 ││
│  │ on first order          ││
│  │ [Activate Offer]        ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  Referral Program           │
│  ┌─────────────────────────┐│
│  │ 👉 Refer a friend       ││
│  │ You & friend get ₹100   ││
│  │                          ││
│  │ Share Code: NRCHUL1234  ││
│  │ [📤 Share] [📋 Copy]    ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

### Screen 15: Notifications
```
┌─────────────────────────────┐
│  ←   Notifications         │
├─────────────────────────────┤
│  Today                      │
│  ┌─────────────────────────┐│
│  │ 🔔 Your order is        ││
│  │ delivered! #NR2024ABCD ││
│  │ 5 mins ago              ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ 🎁 30% OFF on Biryani!  ││
│  │ Use code NRCHULLU30      ││
│  │ 2 hours ago             ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  Yesterday                  │
│  ┌─────────────────────────┐│
│  │ ✅ Order confirmed       ││
│  │ #NR2024ABC9             ││
│  │ 1 day ago               ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  This Week                  │
│  ┌─────────────────────────┐│
│  │ 🚴 Delivery partner      ││
│  │ assigned: Raj Kumar     ││
│  │ 3 days ago              ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  ┌─────────────────────────┐│
│  │ [    Settings    ]      ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

### Screen 16: Restaurant Detail (Maps Style)
```
┌─────────────────────────────┐
│  ←                          │
├─────────────────────────────┤
│  [Parallax Hero Image]      │
│  ┌─────────────────────────┐│
│  │ Nellore Kitchen 👑      ││
│  │ ⭐ 4.5 (1.2k ratings)  ││
│  │ 🍽️ Chinese • North Indian││
│  │ 📍 1.2 km away          ││
│  │ 💰 ₹200 for two         ││
│  │ 🕐 Open 11AM - 11PM     ││
│  │                          ││
│  │ [📞 Call] [⭐ Save]     ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  ┌─────────────────────────┐│
│  │ 🚴 Delivery in 35 mins  ││
│  │ [____MAP____]           ││
│  │                         ││
│  │ 🔵 Restaurant           ││
│  │ 🟢 You                 ││
│  └─────────────────────────┘│
├─────────────────────────────┤
│  📋 Menu [📍 Info] [📝 Reviews]│
├─────────────────────────────┤
│  [Full Menu Scrollable]     │
│  ...                       │
│  ...                       │
└─────────────────────────────┘
```

---

## 4. NAVIGATION FLOWS

```
Onboarding Flow:
Splash → Onboarding1 → Onboarding2 → Onboarding3 → Login

Main User Flow:
Splash → Login → Home Feed → Restaurant → Menu → Cart → Checkout → Payment → Order Confirmed → Tracking

Guest Flow:
Home Feed (browsing) → Login prompt → Login → Continue browsing

Order Flow:
Order Confirmed → Real-time Tracking → Rate Review → Reorder

Profile Flow:
Profile → Edit Profile / Addresses / Payment / Orders / Offers / Settings
```

---

## 5. IMPROVEMENTS & OPTIMIZATIONS

### Reduced Taps (30% improvement)
| Action | Before | After | Improvement |
|--------|--------|-------|-------------|
| Add to cart | 3 taps | 1 tap | -67% |
| Reorder | 5 taps | 2 taps | -60% |
| Track order | 4 taps | 1 tap | -75% |
| Search | 2 taps | 1 tap | -50% |
| Pay order | 4 taps | 2 taps | -50% |

### Performance Optimizations
- Image lazy loading with blur placeholders
- Skeleton screens for instant feedback
- Bottom sheet cart (no page navigation)
- Swipe-to-delete on cart items
- Pull-to-refresh on all lists

### UX Enhancements
- Haptic feedback on add-to-cart
- Micro-animations (300ms ease-in-out)
- Toast notifications for actions
- Skeleton loaders for smooth perceived performance

---

## 6. FIGMA COMPONENTS LIST

### Atoms
- Button (Primary, Secondary, Ghost, Icon)
- Input (Text, OTP, Search)
- Badge (Offer, Status, Count)
- Chip (Filter, Cuisine, Tag)
- Avatar (User, Partner, Restaurant)
- Icon (Vector icons set)

### Molecules
- Food Card (Image, Title, Price, Rating, Add Button)
- Restaurant Card (Image, Name, Rating, Time, Price)
- Offer Card (Banner, Gradient, Animated)
- Address Card (Icon, Text, Edit Button)
- Order Card (ID, Restaurant, Status, Date)

### Organisms
- Header (Logo, Search, Icons)
- Bottom Nav (5 tabs with active state)
- Cart Sheet (Slide-up bottom sheet)
- Filter Sheet (Multi-select bottom sheet)
- Payment Card (Card input with validation)

### Templates
- Screen Frame (iPhone 14 Pro Max - 430x932)
- Safe Area Handling
- Dark/Light Mode Variants

---

## 7. MOBILE APP TECH STACK (React Native)

```typescript
// Recommended stack for mobile app
{
  "framework": "React Native 0.75+",
  "navigation": "React Navigation 6",
  "state": "Zustand",
  "api": "TanStack Query",
  "animations": "Reanimated 3",
  "gestures": "React Native Gesture Handler",
  "storage": "MMKV",
  "maps": "react-native-maps",
  "payments": "razorpay-react-native / stripe-react-native",
  "ui": "React Native Paper (Material Design 3)"
}
```

---

## 8. KEY METRICS TARGETS

| Metric | Target |
|--------|--------|
| App Load Time | < 2 seconds |
| Search Response | < 500ms |
| Add to Cart | < 300ms |
| Checkout Completion | < 30 seconds |
| Order Tracking Update | Real-time (5 sec) |
| Push Notification Delivery | < 10 seconds |

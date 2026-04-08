# NelloreRuchullu Production Setup Guide
## Free & Paid Infrastructure Credentials Reference

---

## 1. GENERATE JWT SECRET KEY (FREE)

```bash
openssl rand -hex 32
```

This generates a cryptographically secure 256-bit key. Example output:
```
53b1edc941a059de98d43679499952f7e7b53791d244106267b867c859c6dc7d
```

**Environment Variable:**
```env
SECRET_KEY=53b1edc941a059de98d43679499952f7e7b53791d244106267b867c859c6dc7d
```

---

## 2. POSTGRESQL DATABASE (FREE - Self Hosted or Cloud)

### Option A: Supabase (RECOMMENDED - 500MB Free)
1. Go to https://supabase.com
2. Sign up with GitHub (free)
3. Create new project → "New Project"
4. Wait 2 minutes for provisioning
5. Go to Settings → API
6. Copy connection string:

```env
DATABASE_URL=postgresql+asyncpg://postgres.xxx:xxxxx@db.xxx.supabase.co:5432/postgres
```

### Option B: Railway (500MB Free)
1. Go to https://railway.app
2. Sign up with GitHub
3. New Project → "Provision PostgreSQL"
4. Copy connection string from Variables tab

### Option C: Self-Hosted (DigitalOcean $4/month)
```env
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@YOUR_SERVER_IP:5432/dbname
```

---

## 3. REDIS CACHE (FREE)

### Option A: Redis Cloud (30MB Free)
1. Go to https://redis.com
2. Sign up free
3. Create free subscription → "Fixed" plan
4. Copy connection string:

```env
REDIS_URL=redis://default:xxxxx@redis-12345.c123.us-east-1-0.ec2.cloud.redislabs.com:12345
```

### Option B: Self-Hosted
```env
REDIS_URL=redis://localhost:6379/0
```

---

## 4. RAZORPAY (Payments - Indian Food Delivery)

For Indian businesses, Razorpay is recommended with lower fees.

### Setup:
1. Go to https://razorpay.com
2. Sign up → Complete KYC
3. Dashboard → Settings → API Keys
4. Generate Key ID and Key Secret
5. For Webhook:
   - Settings → Webhooks
   - Add URL: `https://yourdomain.com/api/v1/payments/webhook`
   - Generate webhook secret

```env
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=de69dcab49b085904b380e37dcabff9e
```

**Fees:** 2% for domestic transactions (industry standard for India)

---

## 5. STRIPE (Payments - International)

For international businesses, Stripe is the standard.

### Setup:
1. Go to https://stripe.com
2. Sign up (no monthly fee)
3. Dashboard → Developers → API Keys
4. Copy Publishable Key and Secret Key
5. For Webhooks:
   - Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/v1/payments/webhook`
   - Copy webhook signing secret

```env
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
```

**Fees:** 2.9% + 30¢ per successful payment

---

## 6. EMAIL (SMTP - FREE)

### Option A: Gmail SMTP (100% FREE - RECOMMENDED)

1. Go to https://myaccount.google.com
2. Security → 2-Step Verification (enable if not already)
3. App Passwords:
   - Search "App Passwords" → Select app "Mail" → Device "Other (Custom name)"
   - Generate → Copy 16-character password
4. Use your Gmail address + App Password

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx    # (App Password with spaces)
```

**Note:** App Password format: `xxxx xxxx xxxx xxxx` (4 groups of 4 characters)

### Option B: SendGrid (100 emails/day FREE)

1. Go to https://sendgrid.com
2. Sign up free
3. Settings → API Keys → Create API Key
4. Full Access → Create

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxxx
```

### Option C: Mailgun (Free Tier)

1. Go to https://mailgun.com
2. Sign up → Add domain or use sandbox
3. Domain Credentials → Copy password

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@yourdomain.com
SMTP_PASSWORD=xxxxxxxxxxxxxxxx
```

---

## 7. SMS (Twilio - Free Trial / Paid)

### Setup:
1. Go to https://twilio.com
2. Sign up (free trial gives $15 credit)
3. Console → Get Started
4. Copy Account SID and Auth Token
5. Get a phone number (trial account has one)
6. Verify recipient numbers for testing

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_FROM_NUMBER=+123456789012    # Your Twilio phone number
```

**Fees:** ~$0.008 per SMS (varies by country)

### Alternative: MessageBird (Free Tier)
1. Go to https://messagebird.com
2. Sign up free
3. Dashboard → API Keys

```env
MESSAGEBIRD_API_KEY=xxxxx
MESSAGEBIRD_FROM_NUMBER=+1234567890
```

---

## 8. IMAGE STORAGE (FREE)

### Option A: Cloudinary (25GB Free)
1. Go to https://cloudinary.com
2. Sign up free
3. Dashboard → Copy Cloud Name

```env
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx
```

### Option B: AWS S3 (5GB Free for 1 year)
1. Go to https://aws.amazon.com/s3
2. Create S3 bucket
3. IAM → Create user with S3 access
4. Copy credentials

### Option C: Use Unsplash URLs (100% FREE)
No setup needed! The seeded data already uses Unsplash URLs:
```
https://images.unsplash.com/photo-xxxxx?w=400
```
Images are served directly from Unsplash CDN.

---

## 9. DOMAIN & SSL

### Free Domain
- https://www.freenom.com (tk, ml, ga, cf, gq domains free)
- https://www.cloudns.net (free DNS)

### SSL Certificate (FREE)
```bash
# Using Let's Encrypt (certbot)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

Or use Cloudflare (free CDN + SSL):
1. Go to https://cloudflare.com
2. Add your domain
3. Update nameservers at your registrar
4. SSL/TLS → Full (free)

---

## 10. HOSTING PLATFORMS

### Backend API (FastAPI)

| Platform | Free Tier | Link |
|---------|----------|------|
| Railway | 3 services, 500hrs/month | https://railway.app |
| Render | 750hrs/month | https://render.com |
| Fly.io | 3 shared VMs, 160GB outbound | https://fly.io |
| DigitalOcean | $4/month droplet | https://digitalocean.com |

### Frontend (Next.js)

| Platform | Free Tier | Link |
|---------|----------|------|
| Vercel | 100GB bandwidth, serverless | https://vercel.com |
| Netlify | 100GB bandwidth | https://netlify.com |
| Cloudflare Pages | Unlimited bandwidth | https://pages.cloudflare.com |

### Database + Cache

| Service | Free Tier | Link |
|---------|----------|------|
| Supabase (PostgreSQL) | 500MB storage | https://supabase.com |
| Railway (PostgreSQL) | 500MB storage | https://railway.app |
| Redis Cloud | 30MB storage | https://redis.com |

---

## 11. ENVIRONMENT FILE EXAMPLE

Create `.env.production`:

```env
# ===========================================
# NELLORE RUCHULLU - PRODUCTION ENVIRONMENT
# ===========================================

# App
APP_NAME=NelloreRuchullu API
VERSION=1.0.0
ENVIRONMENT=production
DEBUG=false
API_PREFIX=/api/v1

# Database (Supabase example)
DATABASE_URL=postgresql+asyncpg://postgres.xxx:xxxxx@db.xxx.supabase.co:5432/postgres

# Redis
REDIS_URL=redis://default:xxxxx@redis-12345.c123.us-east-1-0.ec2.cloud.redislabs.com:12345

# Security (Generate with: openssl rand -hex 32)
SECRET_KEY=YOUR_32_BYTE_HEX_SECRET_HERE

# CORS
CORS_ORIGINS=["https://yourdomain.com","https://www.yourdomain.com"]

# Frontend
FRONTEND_URL=https://yourdomain.com

# ===========================================
# PAYMENTS - Choose Razorpay OR Stripe
# ===========================================

# RAZORPAY (India)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=de69dcab49b085904b380e37dcabff9e

# OR Stripe (International)
# STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
# STRIPE_SECRET_KEY=sk_live_xxxxx
# STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# ===========================================
# EMAIL
# ===========================================

# Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx

# OR SendGrid
# SMTP_HOST=smtp.sendgrid.net
# SMTP_PORT=587
# SMTP_USER=apikey
# SMTP_PASSWORD=SG.xxxxxxx

# ===========================================
# SMS
# ===========================================

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
TWILIO_FROM_NUMBER=+123456789012

# ===========================================
# Rate Limiting
# ===========================================

RATE_LIMIT_PER_MINUTE=30
RATE_LIMIT_LOGIN_PER_HOUR=10
RATE_LIMIT_OTP_PER_HOUR=5
```

---

## 12. QUICK START COMMANDS

### Generate JWT Secret
```bash
openssl rand -hex 32
```

### Generate App Password (Gmail)
1. https://myaccount.google.com → Security
2. 2-Step Verification → ON
3. App Passwords → Mail → Other → "NelloreRuchullu"
4. Copy 16-char password

### Test Email (Verify SMTP)
```bash
curl -s -X POST "https://api.mailgun.net/v3/YOUR_DOMAIN/messages" \
  -u "api:key-YOUR_API_KEY" \
  -F "from=Excited User <mail@YOUR_DOMAIN>" \
  -F "to=recipient@email.com" \
  -F "subject=Hello" \
  -F "text=Testing some Mailgun awesomness!"
```

### Verify Stripe Webhook Locally
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to localhost
stripe listen --forward-to localhost:8000/api/v1/payments/webhook

# Copy webhook signing secret
stripe listen --forward-to localhost:8000/api/v1/payments/webhook --secret whsec_xxx
```

---

## 13. CHECKLIST

- [ ] Generate SECRET_KEY
- [ ] Set up PostgreSQL (Supabase/Railway)
- [ ] Set up Redis (Redis Cloud/Self-hosted)
- [ ] Configure Razorpay OR Stripe
- [ ] Set up Gmail SMTP OR SendGrid
- [ ] Configure Twilio (if SMS needed)
- [ ] Get domain + SSL
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Update CORS_ORIGINS with production domain
- [ ] Test payment webhook
- [ ] Verify email sending
- [ ] Test SMS (if enabled)

---

## 14. ESTIMATED COSTS

| Service | Monthly Cost |
|---------|-------------|
| Backend hosting | $0-5 (free tiers available) |
| Frontend hosting | $0 (Vercel/Netlify free tier) |
| Database | $0 (Supabase free tier) |
| Redis | $0 (Redis Cloud free tier) |
| Domain | $0-10/year (free .tk domain or $10 .com) |
| SSL | $0 (Let's Encrypt/Cloudflare) |
| Payment processing | 2-2.9% per transaction (industry standard) |
| Email | $0 (Gmail SMTP) |
| SMS | $0-5 (Twilio trial credits) |

**Total Fixed Costs: $0-15/year** (only payment processing % per sale)

---

## 15. SUPPORT RESOURCES

| Topic | Link |
|-------|------|
| Supabase Docs | https://supabase.com/docs |
| Railway Docs | https://docs.railway.app |
| Razorpay Docs | https://razorpay.com/docs |
| Stripe Docs | https://stripe.com/docs |
| Twilio Docs | https://www.twilio.com/docs |
| SendGrid Docs | https://docs.sendgrid.com |
| Vercel Deploy | https://vercel.com/docs |
| Let's Encrypt | https://letsencrypt.org |
| Certbot | https://certbot.eff.org |

---

**Last Updated:** April 2026
**Version:** 1.0.0

# VPS Deployment Guide

This guide covers deploying NelloreRuchullu food delivery platform to a Virtual Private Server (VPS).

## Prerequisites

- VPS with Ubuntu 22.04 LTS (minimum 2GB RAM, 2 CPUs)
- Domain name pointed to VPS IP
- Nginx installed
- Docker and Docker Compose installed

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        VPS Server                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Nginx     │  │   Docker    │  │   PostgreSQL        │ │
│  │   (Proxy)   │──│   Compose   │  │   (Container)       │ │
│  │   Port 80   │  │  - Backend  │  │   Port 5432         │ │
│  │   Port 443  │  │  - Celery   │  │                     │ │
│  └─────────────┘  │  - Web      │  └─────────────────────┘ │
│         │         │  - Redis    │                           │
│         │         │  Port 8000   │  ┌─────────────────────┐ │
│         │         │  Port 6379   │  │   Certbot (SSL)     │ │
│         │         └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Step 1: Initial Server Setup

```bash
# Connect to your VPS
ssh root@your-server-ip

# Create non-root user
adduser nellore
usermod -aG sudo nellore

# Switch to new user
su - nellore

# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git ufw fail2ban
```

## Step 2: Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Add user to docker group
sudo usermod -aG docker nellore

# Enable Docker to start on boot
sudo systemctl enable docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

## Step 3: Configure Firewall

```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Step 4: Clone and Configure Project

```bash
# Clone repository
git clone https://github.com/YOUR_ORG/NelloreRuchullu.git
cd NelloreRuchullu

# Create production environment file
cat > .env.production << EOF
# Database
DATABASE_URL=postgresql+asyncpg://nellore:nellore_secure_password@postgres:5432/nellore_ruchullu

# Redis
REDIS_URL=redis://redis:6379/0

# Security
SECRET_KEY=your-production-secret-key-change-this
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ORIGINS=https://yourdomain.com

# Email (configure your SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@yourdomain.com

# Environment
ENVIRONMENT=production
EOF

# Create nginx directory
mkdir -p nginx
```

## Step 5: Configure Nginx

Create `nginx/nginx.conf`:

```nginx
upstream backend {
    server backend:8000;
}

upstream web {
    server web:3000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Client body size
    client_max_body_size 10M;

    # API requests
    location /api/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 120s;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400;
    }

    # Health check
    location /health {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Frontend
    location / {
        proxy_pass http://web;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        proxy_pass http://web;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Step 6: Configure Docker Compose for Production

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./data/certbot:/etc/letsencrypt:ro
    depends_on:
      - backend
      - web
    networks:
      - nellore_network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: >
      sh -c "alembic upgrade head &&
             gunicorn app.main:app --bind 0.0.0.0:8000 --workers 4 --worker-class uvicorn.workers.UvicornWorker --timeout 120"
    env_file:
      - .env.production
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - SECRET_KEY=${SECRET_KEY}
      - ENVIRONMENT=${ENVIRONMENT}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - nellore_network
    restart: unless-stopped

  celery-worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    command: celery -A app.celery_app worker --loglevel=info
    env_file:
      - .env.production
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      - postgres
      - redis
    networks:
      - nellore_network
    restart: unless-stopped

  web:
    build:
      context: ./web
      dockerfile: Dockerfile
    environment:
      - NEXT_PUBLIC_API_URL=https://yourdomain.com
      - NEXT_PUBLIC_WS_URL=wss://yourdomain.com
    networks:
      - nellore_network
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: nellore
      POSTGRES_PASSWORD: nellore_secure_password
      POSTGRES_DB: nellore_ruchullu
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U nellore -d nellore_ruchullu"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - nellore_network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - nellore_network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  nellore_network:
    driver: bridge
```

## Step 7: SSL Certificate

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Stop nginx temporarily
docker-compose -f docker-compose.prod.yml stop nginx

# Obtain SSL certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com --agree-tos --email admin@yourdomain.com --non-interactive

# Create certbot renewal cron job
sudo crontab -e
# Add: 0 0 * * * certbot renew --quiet
```

## Step 8: Deploy

```bash
# Create data directory
mkdir -p data/certbot

# Copy SSL certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem data/certbot/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem data/certbot/
sudo chown -R nellore:nellore data/

# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## Step 9: Database Migrations

```bash
# Run migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Seed database (optional)
docker-compose -f docker-compose.prod.yml exec backend python seed.py
```

## Step 10: Verify Deployment

```bash
# Check health endpoint
curl https://yourdomain.com/health

# Check API
curl https://yourdomain.com/api/v1/menu

# View container status
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs backend | tail -50
```

## Maintenance

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations if needed
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

### Backup Database

```bash
# Create backup directory
mkdir -p backups

# Backup
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U nellore nellore_ruchullu > backups/db_backup_$(date +%Y%m%d_%H%M%S).sql

# Clean old backups (keep last 7)
ls -t backups/*.sql | tail -n +8 | xargs rm -f
```

### Restore Database

```bash
# Stop services
docker-compose -f docker-compose.prod.yml stop backend

# Restore
cat backups/db_backup_YYYYMMDD_HHMMSS.sql | docker-compose -f docker-compose.prod.yml exec -T postgres psql -U nellore nellore_ruchullu

# Start services
docker-compose -f docker-compose.prod.yml start backend
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100 backend
```

### Restart Services

```bash
# Restart all
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend
```

## Monitoring

### Create systemd service for monitoring

```bash
sudo nano /etc/systemd/system/nellore-monitor.service
```

```ini
[Unit]
Description=NelloreRuchullu Monitoring
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
ExecStart=/usr/bin/docker-compose -f /home/nellore/NelloreRuchullu/docker-compose.prod.yml ps
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable nellore-monitor.service
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs <service>

# Check if ports are in use
sudo netstat -tlnp | grep -E '80|443|5432|6379'
```

### Database connection failed

```bash
# Check postgres status
docker-compose -f docker-compose.prod.yml ps postgres

# Test connection
docker-compose -f docker-compose.prod.yml exec postgres psql -U nellore -d nellore_ruchullu
```

### SSL certificate issues

```bash
# Check certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew --force-renewal

# Reload nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### Performance issues

```bash
# Check resource usage
docker stats

# Check container CPU/Memory
docker-compose -f docker-compose.prod.yml top
```

## Security Checklist

- [ ] Change default passwords in `.env.production`
- [ ] Enable UFW firewall
- [ ] Configure fail2ban
- [ ] Use strong SSL/TLS ciphers
- [ ] Enable automatic security updates
- [ ] Set up log rotation
- [ ] Regular backups
- [ ] Monitor resource usage
- [ ] Keep Docker images updated

# Azure Deployment Guide

This guide covers deploying NelloreRuchullu food delivery platform to Microsoft Azure.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Azure Virtual Network                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  App        │  │  App        │  │  Azure Database for │ │
│  │  Service    │──│  Service    │  │  PostgreSQL         │ │
│  │  (Backend)   │  │  (Celery)   │  │  - VNet integration │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│         │                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Front Door │  │  Azure Cache│  │  Blob Storage       │ │
│  │  (CDN/WAF)  │  │  for Redis  │  │  (File storage)    │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

- Azure CLI installed and configured
- Azure subscription with appropriate permissions
- Domain name configured in Azure DNS
- SSL certificate in Key Vault

## Step 1: Create Resource Group

```bash
az group create \
  --name nellore-rg \
  --location eastus

az group create \
  --name nellore-ase-rg \
  --location eastus
```

## Step 2: Create Virtual Network

```bash
az network vnet create \
  --resource-group nellore-rg \
  --name nellore-vnet \
  --address-prefix 10.0.0.0/16 \
  --subnet-name default \
  --subnet-prefix 10.0.1.0/24

az network vnet subnet create \
  --resource-group nellore-rg \
  --vnet-name nellore-vnet \
  --name appservice-subnet \
  --address-prefix 10.0.2.0/24

az network vnet subnet create \
  --resource-group nellore-rg \
  --vnet-name nellore-vnet \
  --name database-subnet \
  --address-prefix 10.0.3.0/24
```

## Step 3: Create PostgreSQL Database

```bash
# Create PostgreSQL server
az postgres server create \
  --resource-group nellore-rg \
  --name nellore-postgres \
  --sku-name B_Gen5_2 \
  --location eastus \
  --admin-user nelloreadmin \
  --admin-password 'YourSecurePassword123!' \
  --ssl-enforcement Enabled \
  --minimal-tls-version TLS1_2

# Create database
az postgres db create \
  --resource-group nellore-rg \
  --server-name nellore-postgres \
  --name nellore_ruchullu

# Configure firewall rules
az postgres server firewall-rule create \
  --resource-group nellore-rg \
  --server-name nellore-postgres \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Enable private endpoint
az network private-endpoint create \
  --resource-group nellore-rg \
  --name nellore-postgres-pe \
  --vnet-name nellore-vnet \
  --subnet database-subnet \
  --private-connection-resource-id $(az postgres server show -g nellore-rg -n nellore-postgres --query id -o tsv) \
  --connection-name nellore-postgres-conn \
  --location eastus
```

## Step 4: Create Redis Cache

```bash
# Create Redis cache
az redis create \
  --resource-group nellore-rg \
  --name nellore-redis \
  --location eastus \
  --sku-type Premium \
  --sku-name Premium_P1 \
  --vm-size c0 \
  --enable-non-ssl-port false \
  --shard-count 1 \
  --replicas-per-master 1

# Create private endpoint for Redis
az network private-endpoint create \
  --resource-group nellore-rg \
  --name nellore-redis-pe \
  --vnet-name nellore-vnet \
  --subnet appservice-subnet \
  --private-connection-resource-id $(az redis show -g nellore-rg -n nellore-redis --query id -o tsv) \
  --connection-name nellore-redis-conn \
  --location eastus
```

## Step 5: Create App Service (Backend)

```bash
# Create App Service Plan
az appservice plan create \
  --resource-group nellore-rg \
  --name nellore-asp \
  --sku P1V2 \
  --is-linux

# Create Web App
az webapp create \
  --resource-group nellore-rg \
  --plan nellore-asp \
  --name nellore-backend \
  --runtime "PYTHON|3.12" \
  --deployment-container-image-name $ACR_LOGIN_SERVER/nellore-backend:latest

# Configure Web App
az webapp config appsettings set \
  --resource-group nellore-rg \
  --name nellore-backend \
  --settings \
    WEBSITES_PORT=8000 \
    DOCKER_REGISTRY_SERVER_URL=https://$ACR_LOGIN_SERVER \
    DOCKER_REGISTRY_SERVER_USERNAME=$ACR_USERNAME \
    DOCKER_REGISTRY_SERVER_PASSWORD=$ACR_PASSWORD

# Enable VNet integration
az webapp vnet-integration add \
  --resource-group nellore-rg \
  --name nellore-backend \
  --vnet nellore-vnet \
  --subnet appservice-subnet
```

## Step 6: Create Container Registry

```bash
# Create Azure Container Registry
az acr create \
  --resource-group nellore-rg \
  --name nelloreacr \
  --sku Premium \
  --location eastus

# Enable admin user
az acr update -n nelloreacr --admin-enabled true

# Get ACR credentials
ACR_USERNAME=$(az acr credential show -n nelloreacr --query username -o tsv)
ACR_PASSWORD=$(az acr credential show -n nelloreacr --query passwords[0].value -o tsv)
ACR_LOGIN_SERVER=$(az acr show -n nelloreacr --query loginServer -o tsv)

# Login to ACR
az acr login -n nelloreacr

# Tag and push images
docker tag nellore-backend $ACR_LOGIN_SERVER/nellore-backend:latest
docker push $ACR_LOGIN_SERVER/nellore-backend:latest
```

## Step 7: Create Web App (Frontend)

```bash
# Create Web App for frontend
az webapp create \
  --resource-group nellore-rg \
  --plan nellore-asp \
  --name nellore-web \
  --startup-command "npm run start" \
  --deployment-source-url https://github.com/YOUR_ORG/NelloreRuchullu \
  --branch main

# Configure environment variables
az webapp config appsettings set \
  --resource-group nellore-rg \
  --name nellore-web \
  --settings \
    NEXT_PUBLIC_API_URL=https://nellore-backend.azurewebsites.net \
    NEXT_PUBLIC_WS_URL=wss://nellore-backend.azurewebsites.net
```

## Step 8: Configure Azure Front Door

```bash
# Create Front Door
az network front-door create \
  --resource-group nellore-rg \
  --name nellore-frontdoor \
  --backend-address NelloreBackend.azurewebsites.net \
  --frontend-host nellore-frontdoor.azurefd.net

# Add web app to backend pool
az network front-door backend-pool create \
  --resource-group nellore-rg \
  --front-door-name nellore-frontdoor \
  --name webapp-backend \
  --address nellore-web.azurewebsites.net

# Configure routing rule
az network front-door routing-rule create \
  --resource-group nellore-rg \
  --front-door-name nellore-frontdoor \
  --name webapp-route \
  --frontend-endpoints default \
  --backend-pool webapp-backend \
  --route-type MatchAll
```

## Step 9: Configure Key Vault for Secrets

```bash
# Create Key Vault
az keyvault create \
  --resource-group nellore-rg \
  --name nellore-kv \
  --location eastus \
  --sku Standard

# Add secrets
az keyvault secret set \
  --vault-name nellore-kv \
  --name "DATABASE-URL" \
  --value "postgresql+asyncpg://..."

az keyvault secret set \
  --vault-name nellore-kv \
  --name "REDIS-URL" \
  --value "redis://..."

az keyvault secret set \
  --vault-name nellore-kv \
  --name "SECRET-KEY" \
  --value "your-256-bit-secret"

# Grant App Service access to Key Vault
az keyvault set-policy \
  --name nellore-kv \
  --spn $(az webapp show -g nellore-rg -n nellore-backend --query identity.principalId -o tsv) \
  --secret-permissions get list
```

## Step 10: Configure Application Insights

```bash
# Create Application Insights
az monitor app-insights component create \
  --app nellore-appinsights \
  --location eastus \
  --resource-group nellore-rg \
  --application-type web

# Get instrumentation key
INSTRUMENTATION_KEY=$(az monitor app-insights component show -g nellore-rg -n nellore-appinsights --query instrumentationKey -o tsv)

# Add to App Service
az webapp config appsettings set \
  --resource-group nellore-rg \
  --name nellore-backend \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY=$INSTRUMENTATION_KEY
```

## Environment Variables

Configure these in App Service Application Settings:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://user:pass@host:5432/db` |
| `REDIS_URL` | Redis connection string | `rediss://host:6380` |
| `SECRET_KEY` | FastAPI secret key | `your-256-bit-secret` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration | `30` |
| `ALLOWED_HOSTS` | Allowed hosts | `nellore-backend.azurewebsites.net` |
| `WEBSITES_PORT` | Backend port | `8000` |

## Deployment with GitHub Actions

Add these secrets to GitHub:
- `AZURE_CREDENTIALS` - Service principal JSON
- `ACR_USERNAME` - Container registry username
- `ACR_PASSWORD` - Container registry password

Create `deploy-azure.yml`:

```yaml
- uses: azure/webapps-deploy@v3
  with:
    app-name: nellore-backend
    slot-name: production
    images: ${{ env.ACR_LOGIN_SERVER }}/nelliore-backend:${{ github.sha }}
    credentials: ${{ secrets.AZURE_CREDENTIALS }}
```

## Scaling

### Scale App Service
```bash
# Scale up
az appservice plan update \
  --resource-group nellore-rg \
  --name nellore-asp \
  --sku P2V2

# Scale out
az webapp update \
  --resource-group nellore-rg \
  --name nellore-backend \
  --number-of-workers 4
```

### Scale PostgreSQL
```bash
az postgres server update \
  --resource-group nellore-rg \
  --name nellore-postgres \
  --sku-name GP_Gen5_4
```

## Monitoring

```bash
# View App Service logs
az webapp log tail \
  --resource-group nellore-rg \
  --name nellore-backend

# Enable diagnostics
az monitor diagnostic-settings create \
  --name nellore-monitoring \
  --resource-group nellore-rg \
  --logs '[{"category":"AppServiceHTTPLogs","enabled":true}]' \
  --metrics '[{"category":"AllMetrics","enabled":true}]'
```

## Troubleshooting

### Check deployment status
```bash
az webapp deployment list-publishing-credentials \
  --resource-group nellore-rg \
  --name nellore-backend
```

### Restart App Service
```bash
az webapp restart \
  --resource-group nellore-rg \
  --name nellore-backend
```

### View logs in Azure
```bash
az webapp log download \
  --resource-group nellore-rg \
  --name nellore-backend \
  --log-file logs.zip
```

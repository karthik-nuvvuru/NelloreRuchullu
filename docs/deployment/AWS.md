# AWS Deployment Guide

This guide covers deploying NelloreRuchullu food delivery platform to AWS.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      VPC (10.0.0.0/16)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   ALB       │  │  ECS Fargate │  │  RDS PostgreSQL     │ │
│  │ (load       │──│  - Backend   │  │  - Multi-AZ         │ │
│  │  balancer)  │  │  - Celery    │  │  - Automated backups│ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│         │                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  CloudFront │  │  ElastiCache│  │  EFS                │ │
│  │ (CDN)       │  │  (Redis)    │  │  (File storage)     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

- AWS CLI configured with appropriate credentials
- ECS CLI (for container deployments)
- Domain name configured in Route 53
- SSL certificate in ACM

## Step 1: Create the VPC

```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=nellore-vpc}]'

VPC_ID=$(aws ec2 describe-vpcs --filters 'Name=tag:Name,Values=nellore-vpc' --query 'Vpcs[0].VpcId' --output text)

# Create subnets
aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.1.0/24 --availability-zone us-east-1a --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=nellore-public-1}]'
aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.2.0/24 --availability-zone us-east-1b --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=nellore-public-2}]'
aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.10.0/24 --availability-zone us-east-1a --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=nellore-private-1}]'
aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.11.0/24 --availability-zone us-east-1b --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=nellore-private-2}]'

# Create Internet Gateway
aws ec2 create-internet-gateway --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=nellore-igw}]'
```

## Step 2: Create RDS PostgreSQL

```bash
# Create DB subnet group
aws rds create-db-subnet-group \
  --db-subnet-group-name nellore-db-subnet \
  --db-subnet-group-description "Nellore DB subnet group" \
  --subnet-ids subnet-xxxxx subnet-xxxxx

# Create PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier nellore-ruchullu-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 16.2 \
  --allocated-storage 100 \
  --storage-type gp3 \
  --master-username nelloreadmin \
  --master-user-password 'YourSecurePassword123!' \
  --db-name nellore_ruchullu \
  --db-subnet-group-name nellore-db-subnet \
  --vpc-security-group-ids sg-xxxxx \
  --multi-az \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "mon:04:00-mon:05:00"
```

## Step 3: Create ElastiCache (Redis)

```bash
# Create Redis subnet group
aws elasticache create-subnet-group \
  --subnet-group-name nellore-redis-subnet \
  --description "Nellore Redis subnet group" \
  --subnet-ids subnet-xxxxx subnet-xxxxx

# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id nellore-redis \
  --cache-node-type cache.t3.medium \
  --engine redis \
  --engine-version 7.1 \
  --cache-subnet-group-name nellore-redis-subnet \
  --security-group-ids sg-xxxxx \
  --num-cache-nodes 1 \
  --automatic-failover-enabled
```

## Step 4: Create ECR Repositories

```bash
# Create ECR repositories
aws ecr create-repository --repository-name nellore-ruchullu/backend
aws ecr create-repository --repository-name nellore-ruchullu/web

# Get login token
aws ecr get-login-password | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

## Step 5: Build and Push Docker Images

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=us-east-1

# Build and push backend
docker build -t nellore-backend ./backend
docker tag nellore-backend $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/nellore-ruchullu/backend:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/nellore-ruchullu/backend:latest

# Build and push web
docker build -t nellore-web ./web
docker tag nellore-web $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/nellore-ruchullu/web:latest
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/nellore-ruchullu/web:latest
```

## Step 6: Create ECS Task Definitions

Create `backend-task-def.json`:

```json
{
  "family": "nellore-backend",
  "cpu": "512",
  "memory": "1024",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/nellore-ruchullu/backend:latest",
      "essential": true,
      "portMappings": [{"containerPort": 8000}],
      "environment": [
        {"name": "DATABASE_URL", "value": "postgresql+asyncpg://..."},
        {"name": "REDIS_URL", "value": "redis://..."},
        {"name": "SECRET_KEY", "value": "your-secret-key"},
        {"name": "ENVIRONMENT", "value": "production"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group-name": "/ecs/nellore-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

Register the task definition:

```bash
aws ecs register-task-definition --cli-input-json file://backend-task-def.json
```

## Step 7: Create ECS Service

```bash
# Create load balancer
aws elbv2 create-load-balancer \
  --name nellore-alb \
  --subnets subnet-xxxxx subnet-xxxxx \
  --security-group-ids sg-xxxxx \
  --scheme internet-facing

# Create target group
aws elbv2 create-target-group \
  --name nellore-backend-tg \
  --protocol HTTP \
  --port 8000 \
  --target-type ip \
  --vpc-id vpc-xxxxx \
  --health-check-path /health

# Create ECS cluster
aws ecs create-cluster --cluster-name nellore-cluster

# Create service
aws ecs create-service \
  --cluster nellore-cluster \
  --service-name nellore-backend \
  --task-definition nellore-backend \
  --desired-count 2 \
  --load-balancers 'targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=backend,containerPort=8000' \
  --network-configuration 'awsvpcConfiguration={subnets=[subnet-xxxxx,subnet-xxxxx],securityGroups=[sg-xxxxx]}'
```

## Step 8: Configure CI/CD with GitHub Actions

Add these secrets to your GitHub repository:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `ECR_REGISTRY`

The CI workflow in `.github/workflows/ci.yml` will automatically deploy on push to main branch.

## Environment Variables

Required environment variables for production:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://user:pass@host:5432/db` |
| `REDIS_URL` | Redis connection string | `redis://host:6379/0` |
| `SECRET_KEY` | Django/FastAPI secret key | `your-256-bit-secret` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration | `30` |
| `ALLOWED_HOSTS` | CORS allowed hosts | `.yourdomain.com` |
| `CORS_ORIGINS` | CORS origins | `https://yourdomain.com` |
| `SMTP_HOST` | Email SMTP server | `email-smtp.us-east-1.amazonaws.com` |
| `SMTP_USER` | SMTP username | `AKIA...` |
| `SMTP_PASSWORD` | SMTP password | `...` |
| `FROM_EMAIL` | Default from email | `noreply@yourdomain.com` |

## Health Checks

Configure health check on ALB:
- Path: `/health`
- Healthy threshold: 2
- Unhealthy threshold: 3
- Timeout: 5 seconds
- Interval: 30 seconds

## Monitoring

Set up CloudWatch dashboards and alarms:

```bash
# Create log group
aws logs create-log-group --log-group-name /ecs/nellore-backend

# Create alarm for high CPU
aws cloudwatch put-metric-alarm \
  --alarm-name nellore-high-cpu \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

## Scaling

```bash
# Auto scaling for backend
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/nellore-cluster/nellore-backend \
  --policy-name nellore-cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{"TargetValue": 70, "ScaleInCooldown": 300, "ScaleOutCooldown": 60, "PredefinedMetricSpecification": {"PredefinedMetricType": "ECSServiceAverageCPUUtilization"}}'
```

## Troubleshooting

### Backend logs
```bash
aws logs tail /ecs/nellore-backend --follow
```

### Check service status
```bash
aws ecs describe-services --cluster nellore-cluster --services nellore-backend
```

### Restart service
```bash
aws ecs update-service --cluster nellore-cluster --service nellore-backend --force-new-deployment
```

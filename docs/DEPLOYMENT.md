# Deployment Guide

Complete guide for deploying the Industrial Sensor Network to Azure.

## Prerequisites

- Azure subscription
- Azure CLI installed
- Terraform >= 1.5
- GitHub repository
- Node.js 20 LTS
- Docker (for backend container)

## Overview

Deployment involves:
1. Infrastructure (Terraform)
2. Backend API (Azure Container Apps)
3. Web Application (Azure Static Web Apps)
4. Device Provisioning (Azure IoT Hub DPS)

## 1. Infrastructure Deployment

### Setup Azure CLI

```bash
# Login to Azure
az login

# Set subscription
az account set --subscription <subscription-id>

# Create service principal for Terraform
az ad sp create-for-rbac --name "terraform-sp" --role="Contributor" \
  --scopes="/subscriptions/<subscription-id>"
```

### Configure Terraform

```bash
cd infra/terraform/env/dev

# Create terraform.tfvars
cat > terraform.tfvars << EOF
location = "eastus"
environment = "dev"
db_admin_password = "<secure-password>"
EOF
```

### Deploy Infrastructure

```bash
# Initialize Terraform
terraform init

# Plan deployment
terraform plan -out=tfplan

# Apply deployment
terraform apply tfplan

# Save outputs
terraform output -json > outputs.json
```

### Infrastructure Components Deployed

- ✅ Resource Group
- ✅ Azure IoT Hub (S1 SKU)
- ✅ Device Provisioning Service
- ✅ PostgreSQL Database
- ✅ Container Apps Environment
- ✅ Log Analytics Workspace
- ✅ Application Insights
- ✅ Static Web Apps
- ✅ Key Vault

## 2. Backend Deployment

### Build Container Image

```bash
cd backend/api

# Build Docker image
docker build -t industrial-sensor-backend:latest .

# Tag for Azure Container Registry
docker tag industrial-sensor-backend:latest \
  <acr-name>.azurecr.io/backend:latest

# Push to ACR
az acr login --name <acr-name>
docker push <acr-name>.azurecr.io/backend:latest
```

### Configure Environment Variables

```bash
# Get connection strings from Terraform outputs
IOT_HUB_CONNECTION=$(terraform output -raw iot_hub_connection_string)
DB_CONNECTION=$(terraform output -raw database_connection_string)
APP_INSIGHTS_KEY=$(terraform output -raw app_insights_key)

# Create environment variables file
cat > backend/.env.production << EOF
NODE_ENV=production
PORT=3000
DATABASE_HOST=<db-host>
DATABASE_PORT=5432
DATABASE_NAME=industrial_sensor
DATABASE_USER=<db-user>
DATABASE_PASSWORD=<db-password>
DATABASE_SSL=true
IOT_HUB_CONNECTION_STRING=${IOT_HUB_CONNECTION}
JWT_SECRET=<secure-secret>
APPLICATIONINSIGHTS_CONNECTION_STRING=<app-insights-connection>
EOF
```

### Deploy to Container Apps

```bash
# Deploy using Azure CLI
az containerapp update \
  --name backend-api \
  --resource-group <resource-group> \
  --image <acr-name>.azurecr.io/backend:latest \
  --set-env-vars \
    DATABASE_HOST=<db-host> \
    DATABASE_NAME=industrial_sensor \
    IOT_HUB_CONNECTION_STRING=secretref:iot-hub-connection
```

### Run Database Migrations

```bash
# Connect to Container App
az containerapp exec --name backend-api --resource-group <resource-group>

# Run migrations
npm run migration:run

# Seed initial data (optional)
npm run seed
```

## 3. Web Application Deployment

### Build Web App

```bash
cd apps/web

# Install dependencies
npm ci

# Build for production
npm run build

# Output in dist/
```

### Deploy to Static Web Apps

#### Option 1: GitHub Actions (Recommended)

```yaml
# .github/workflows/azure-static-web-apps.yml
name: Deploy Web App

on:
  push:
    branches: [main]

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/apps/web"
          api_location: ""
          output_location: "dist"
```

#### Option 2: Azure CLI

```bash
# Get deployment token
DEPLOY_TOKEN=$(az staticwebapp secrets list \
  --name web-app \
  --resource-group <resource-group> \
  --query "properties.apiKey" -o tsv)

# Deploy
az staticwebapp deploy \
  --name web-app \
  --resource-group <resource-group> \
  --source ./dist \
  --token $DEPLOY_TOKEN
```

### Configure Web App

```bash
# Set environment variables
az staticwebapp appsettings set \
  --name web-app \
  --setting-names \
    VITE_API_URL=https://backend-api.<region>.azurecontainerapps.io/api
```

## 4. Device Provisioning Setup

### Configure DPS

```bash
# Get DPS ID Scope
DPS_ID_SCOPE=$(terraform output -raw dps_id_scope)

# Create enrollment group
az iot dps enrollment-group create \
  --dps-name <dps-name> \
  --resource-group <resource-group> \
  --enrollment-id hubs-enrollment \
  --allocation-policy static \
  --iot-hubs <iot-hub-name>.azure-devices.net
```

### Hub Provisioning Flow

1. **Manufacturing**:
   - Generate device certificate
   - Store certificate in hub secure storage
   - Provision device with DPS ID Scope

2. **First Boot**:
   - Hub connects to DPS
   - DPS assigns hub to IoT Hub
   - Hub receives connection string
   - Hub connects to IoT Hub

3. **Runtime**:
   - Hub maintains connection
   - Synchronizes Device Twin
   - Reports telemetry

## 5. GitHub Actions CI/CD

### Setup Secrets

```bash
# GitHub repository secrets
gh secret set AZURE_CREDENTIALS --body '{"clientId":"...","clientSecret":"...","subscriptionId":"...","tenantId":"..."}'
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN --body '<token>'
gh secret set ACR_USERNAME --body '<username>'
gh secret set ACR_PASSWORD --body '<password>'
gh secret set DATABASE_URL --body '<connection-string>'
```

### CI/CD Workflow

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  backend-ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: cd backend/api && npm ci
      - run: cd backend/api && npm test
      - run: cd backend/api && npm run build
  
  backend-cd:
    needs: backend-ci
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      - run: |
          docker build -t ${{ secrets.ACR_NAME }}.azurecr.io/backend:${{ github.sha }} backend/api
          docker push ${{ secrets.ACR_NAME }}.azurecr.io/backend:${{ github.sha }}
      - run: |
          az containerapp update \
            --name backend-api \
            --resource-group <resource-group> \
            --image ${{ secrets.ACR_NAME }}.azurecr.io/backend:${{ github.sha }}
  
  web-ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd apps/web && npm ci
      - run: cd apps/web && npm run build
      - run: cd apps/web && npx playwright install
      - run: cd apps/web && npx playwright test
  
  web-cd:
    needs: web-ci
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/apps/web"
          output_location: "dist"
```

## 6. Monitoring and Observability

### Application Insights

```bash
# Query logs
az monitor app-insights query \
  --app <app-insights-name> \
  --analytics-query "requests | where timestamp > ago(1h) | summarize count() by resultCode"

# View metrics
az monitor metrics list \
  --resource <container-app-id> \
  --metric "Requests"
```

### Log Analytics

```bash
# Query container logs
az monitor log-analytics query \
  --workspace <workspace-id> \
  --analytics-query "ContainerAppConsoleLogs_CL | where TimeGenerated > ago(1h)"
```

### Alerts

```bash
# Create alert for high error rate
az monitor metrics alert create \
  --name high-error-rate \
  --resource-group <resource-group> \
  --scopes <container-app-id> \
  --condition "avg Percentage CPU > 80" \
  --window-size 5m \
  --evaluation-frequency 1m
```

## 7. Scaling

### Backend Scaling

```bash
# Configure auto-scaling
az containerapp update \
  --name backend-api \
  --resource-group <resource-group> \
  --min-replicas 2 \
  --max-replicas 10 \
  --scale-rule-name http-rule \
  --scale-rule-type http \
  --scale-rule-http-concurrency 50
```

### Database Scaling

```bash
# Scale up database
az postgres flexible-server update \
  --name <db-server> \
  --resource-group <resource-group> \
  --sku-name Standard_D4s_v3
```

## 8. Backup and Disaster Recovery

### Database Backup

```bash
# Configure backup retention
az postgres flexible-server update \
  --name <db-server> \
  --resource-group <resource-group> \
  --backup-retention 35 \
  --geo-redundant-backup Enabled
```

### Point-in-Time Restore

```bash
# Restore to specific time
az postgres flexible-server restore \
  --resource-group <resource-group> \
  --name <restored-server> \
  --source-server <db-server> \
  --restore-time "2024-12-23T10:00:00Z"
```

## 9. Security

### Key Vault Secrets

```bash
# Store secrets in Key Vault
az keyvault secret set \
  --vault-name <key-vault> \
  --name iot-hub-connection \
  --value "<connection-string>"

# Grant Container App access
az keyvault set-policy \
  --name <key-vault> \
  --object-id <container-app-identity> \
  --secret-permissions get list
```

### Network Security

```bash
# Restrict Container App ingress
az containerapp ingress update \
  --name backend-api \
  --resource-group <resource-group> \
  --allow-insecure false

# Configure firewall
az postgres flexible-server firewall-rule create \
  --resource-group <resource-group> \
  --name <db-server> \
  --rule-name allow-azure-services \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

## 10. Environments

### Development

- **Purpose**: Development and testing
- **SKU**: Minimal (Basic/Free tier where possible)
- **Data**: Test data only
- **Access**: All developers

### Staging

- **Purpose**: Pre-production validation
- **SKU**: Production-like
- **Data**: Anonymized production data
- **Access**: QA team + selected developers

### Production

- **Purpose**: Live system
- **SKU**: Production tier (S1, Standard_D2s_v3)
- **Data**: Real customer data
- **Access**: Operations team only
- **Monitoring**: 24/7 alerts
- **Backup**: Daily automated backups

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
az containerapp logs show \
  --name backend-api \
  --resource-group <resource-group> \
  --tail 100

# Check environment variables
az containerapp show \
  --name backend-api \
  --resource-group <resource-group> \
  --query "properties.template.containers[0].env"
```

### Database Connection Issues

```bash
# Test connection
psql "host=<db-host> port=5432 dbname=industrial_sensor user=<user> password=<password> sslmode=require"

# Check firewall rules
az postgres flexible-server firewall-rule list \
  --resource-group <resource-group> \
  --name <db-server>
```

### Static Web App Not Loading

```bash
# Check deployment status
az staticwebapp show \
  --name web-app \
  --resource-group <resource-group> \
  --query "defaultHostname"

# Rebuild and redeploy
cd apps/web
npm run build
az staticwebapp deploy --name web-app --source ./dist
```

## Maintenance

### Regular Tasks

- **Daily**: Monitor Application Insights dashboards
- **Weekly**: Review error logs, check scaling metrics
- **Monthly**: Update dependencies, review costs
- **Quarterly**: Security audit, backup restore test

### Updates

```bash
# Update backend
cd backend/api
npm update
npm audit fix
docker build -t <acr>.azurecr.io/backend:$(git rev-parse --short HEAD) .
docker push <acr>.azurecr.io/backend:$(git rev-parse --short HEAD)
az containerapp update --image <acr>.azurecr.io/backend:$(git rev-parse --short HEAD)

# Update web
cd apps/web
npm update
npm audit fix
npm run build
az staticwebapp deploy --source ./dist
```

## Cost Optimization

- Use **Basic tier** for dev environment
- Enable **auto-pause** for dev database
- Set **scale-to-zero** for dev Container Apps
- Use **reserved capacity** for production database
- Monitor with **Azure Cost Management**

## Resources

- [Azure Container Apps Documentation](https://learn.microsoft.com/azure/container-apps/)
- [Azure Static Web Apps Documentation](https://learn.microsoft.com/azure/static-web-apps/)
- [Azure IoT Hub Documentation](https://learn.microsoft.com/azure/iot-hub/)
- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)

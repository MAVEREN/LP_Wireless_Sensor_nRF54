# Environment Configuration Guide

This document describes environment-specific configuration for the Industrial IoT Sensor Network.

## Environments

### Development (dev)
- **Purpose**: Local development and testing
- **IoT Hub**: B1 tier, 1 unit
- **Database**: 7-day backups, no geo-redundancy
- **Backend**: 1-3 replicas
- **Monitoring**: Basic

### Staging (staging)
- **Purpose**: Pre-production testing and validation
- **IoT Hub**: S1 tier, 1 unit  
- **Database**: 14-day backups, geo-redundant
- **Backend**: 1-5 replicas
- **Monitoring**: Full with alerts

### Production (prod)
- **Purpose**: Live production system
- **IoT Hub**: S2 tier, 2 units
- **Database**: 35-day backups, geo-redundant, high-availability
- **Backend**: 2-10 replicas
- **Monitoring**: Full with alerts, multi-region

## Deployment

### Infrastructure
```bash
# Deploy to staging
cd infra/terraform/env/staging
terraform init
terraform plan
terraform apply

# Deploy to production (requires approval)
cd ../prod
terraform init
terraform plan
terraform apply
```

### Backend
Use GitHub Actions workflow `deploy-backend.yml`:
```
workflow_dispatch → Select environment → Deploy
```

### Web
Use GitHub Actions workflow `deploy-web.yml`:
```
workflow_dispatch → Select environment → Deploy
```

## Secrets

Each environment requires:
- AZURE_CREDENTIALS
- AZURE_STATIC_WEB_APPS_API_TOKEN_{ENV}
- ACR_NAME
- Azure AD credentials
- Database passwords

Store in GitHub Secrets and Azure Key Vault.

## URLs

**Dev**:
- Backend: https://backend-dev.azurewebsites.net
- Web: https://industrial-iot-dev.azurestaticapps.net

**Staging**:
- Backend: https://backend-staging.azurewebsites.net
- Web: https://industrial-iot-staging.azurestaticapps.net

**Production**:
- Backend: https://api.industrial-iot.com
- Web: https://app.industrial-iot.com

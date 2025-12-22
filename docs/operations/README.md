# Operations Runbooks

Operational procedures and runbooks for the Industrial Sensor Network.

## Table of Contents

1. [Incident Response](#incident-response)
2. [Key Rotation](#key-rotation)
3. [Firmware Rollout](#firmware-rollout)
4. [Database Backup and Recovery](#database-backup-and-recovery)
5. [Monitoring and Alerts](#monitoring-and-alerts)
6. [Rollback Procedures](#rollback-procedures)

## Incident Response

### Severity Levels

- **P0 (Critical)**: Complete service outage, data loss risk
- **P1 (High)**: Major functionality impaired, customer impact
- **P2 (Medium)**: Minor functionality impaired, workaround exists
- **P3 (Low)**: Cosmetic issue, no functional impact

### Response Procedure

#### 1. Detection

Incidents detected via:
- Azure Monitor alerts
- Customer reports
- Automated health checks

#### 2. Triage

```bash
# Check service health
az monitor metrics list \
  --resource /subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.Web/sites/{app} \
  --metric "Http5xx" \
  --start-time 2025-01-01T00:00:00Z

# Check IoT Hub metrics
az iot hub show-stats --name {iot-hub-name}

# Check database
az postgres flexible-server show \
  --resource-group {rg} \
  --name {db-name}
```

#### 3. Communication

- Create incident in tracking system
- Notify stakeholders via defined channels
- Update status page

#### 4. Investigation

Common investigation queries:

```bash
# Application Insights logs
az monitor app-insights query \
  --app {app-insights-name} \
  --analytics-query "exceptions | where timestamp > ago(1h) | take 100"

# Device Twin errors
az iot hub query \
  --hub-name {hub-name} \
  --query-command "SELECT * FROM devices WHERE properties.reported.errors != null"
```

#### 5. Resolution

Document:
- Root cause
- Remediation steps
- Timeline
- Action items

#### 6. Post-Mortem

Within 48 hours:
- Write incident report
- Identify preventive measures
- Update runbooks
- Schedule follow-up

## Key Rotation

### Azure Key Vault Secrets

Rotation schedule: Every 90 days

#### Database Connection String

```bash
# Generate new password
NEW_PASSWORD=$(openssl rand -base64 32)

# Update PostgreSQL password
az postgres flexible-server update \
  --resource-group {rg} \
  --name {db-name} \
  --admin-password "$NEW_PASSWORD"

# Update Key Vault secret
az keyvault secret set \
  --vault-name {kv-name} \
  --name "DatabasePassword" \
  --value "$NEW_PASSWORD"

# Restart applications to pick up new secret
az containerapp revision restart \
  --resource-group {rg} \
  --name {app-name}
```

#### IoT Hub Shared Access Keys

```bash
# Regenerate secondary key
az iot hub policy renew-key \
  --hub-name {hub-name} \
  --name service \
  --renew-key secondary

# Update applications to use secondary
# (via Key Vault update)

# After verification, regenerate primary
az iot hub policy renew-key \
  --hub-name {hub-name} \
  --name service \
  --renew-key primary
```

#### JWT Signing Keys

```bash
# Generate new key pair
openssl genrsa -out private_new.pem 4096
openssl rsa -in private_new.pem -pubout -out public_new.pem

# Add new key to Key Vault
az keyvault secret set \
  --vault-name {kv-name} \
  --name "JwtPrivateKey-v2" \
  --file private_new.pem

# Update backend to support both keys (dual-key period)
# After 24 hours, remove old key
```

## Firmware Rollout

### Staged Rollout Process

#### Phase 1: Canary (1% of devices)

```bash
# Create firmware release
az iot hub device-twin update \
  --hub-name {hub-name} \
  --device-id {canary-device-id} \
  --desired '{
    "firmwareUpdate": {
      "version": "1.1.0",
      "url": "https://storage.blob.core.windows.net/firmware/node-1.1.0.bin",
      "checksum": "sha256:abc123...",
      "scheduledAt": "2025-01-15T02:00:00Z"
    }
  }'

# Monitor canary devices for 24 hours
az iot hub monitor-events --hub-name {hub-name} --device-id {canary-device-id}
```

#### Phase 2: Pilot (10% of devices)

After canary success:

```bash
# Query devices for pilot group
az iot hub query \
  --hub-name {hub-name} \
  --query-command "SELECT * FROM devices WHERE tags.updateGroup = 'pilot'"

# Batch update via job
az iot hub device-twin update-batch \
  --hub-name {hub-name} \
  --device-ids @pilot-devices.json \
  --desired @firmware-update-desired.json
```

#### Phase 3: Production Rollout

After 3-day pilot:

```bash
# Gradual rollout (10% per day)
./scripts/firmware-rollout.sh \
  --version 1.1.0 \
  --batch-size 10 \
  --interval 1d \
  --exclude canary,pilot
```

### Rollback Firmware

```bash
# Emergency rollback to previous version
az iot hub device-twin update-batch \
  --hub-name {hub-name} \
  --device-ids @affected-devices.json \
  --desired '{
    "firmwareUpdate": {
      "version": "1.0.9",
      "url": "https://storage.blob.core.windows.net/firmware/node-1.0.9.bin",
      "checksum": "sha256:def456...",
      "scheduledAt": "now"
    }
  }'
```

## Database Backup and Recovery

### Automated Backups

Azure PostgreSQL Flexible Server:
- Point-in-time restore: Last 7 days
- Geo-redundant backups: Enabled for production

### Manual Backup

```bash
# Create on-demand backup
az postgres flexible-server backup create \
  --resource-group {rg} \
  --name {db-name} \
  --backup-name manual-backup-$(date +%Y%m%d-%H%M%S)
```

### Restore from Backup

```bash
# List available restore points
az postgres flexible-server restore list \
  --resource-group {rg} \
  --name {db-name}

# Restore to new server
az postgres flexible-server restore \
  --resource-group {rg} \
  --name {db-name-restored} \
  --source-server {db-name} \
  --restore-time "2025-01-15T10:00:00Z"

# Verify data integrity
psql -h {db-name-restored}.postgres.database.azure.com -U adminuser -d industrial_sensor

# Swap if verification successful
# (Update connection strings via Key Vault)
```

### Disaster Recovery

For regional outage:

```bash
# Geo-restore to secondary region
az postgres flexible-server geo-restore \
  --resource-group {rg-secondary} \
  --name {db-name-dr} \
  --source-server {db-name} \
  --location eastus2
```

## Monitoring and Alerts

### Key Metrics

**Backend API**:
- Request rate
- Error rate (5xx)
- Response time (p95, p99)
- CPU/Memory utilization

**IoT Hub**:
- Connected device count
- Message rate (telemetry, twin updates)
- Throttled requests
- Failed connections

**Database**:
- Connection count
- Query performance
- Storage utilization
- Replication lag

### Alert Rules

```bash
# Create alert for high error rate
az monitor metrics alert create \
  --name "Backend-High-Error-Rate" \
  --resource-group {rg} \
  --scopes {backend-resource-id} \
  --condition "avg Http5xx > 10" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action {action-group-id}

# Create alert for device disconnections
az monitor metrics alert create \
  --name "IoT-Hub-Device-Disconnected" \
  --resource-group {rg} \
  --scopes {iothub-resource-id} \
  --condition "avg ConnectedDeviceCount < 950" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --action {action-group-id}
```

### Dashboard

Access Azure Monitor dashboard:
```
https://portal.azure.com/#blade/Microsoft_Azure_Monitoring/AzureMonitoringBrowseBlade/dashboards
```

Or use Grafana for custom views.

## Rollback Procedures

### Backend Rollback

```bash
# List revisions
az containerapp revision list \
  --resource-group {rg} \
  --name {backend-app}

# Set traffic to previous revision
az containerapp revision set-traffic \
  --resource-group {rg} \
  --name {backend-app} \
  --revision-weight {previous-revision}=100 {current-revision}=0

# Deactivate current revision
az containerapp revision deactivate \
  --resource-group {rg} \
  --name {backend-app} \
  --revision {current-revision}
```

### Web App Rollback

```bash
# Static Web Apps - swap to previous environment
az staticwebapp environment delete \
  --name {web-app} \
  --environment-name production

# Re-deploy previous build from GitHub
git revert HEAD
git push origin main
# CI/CD will auto-deploy
```

### Infrastructure Rollback

```bash
# Terraform rollback to previous state
cd infra/terraform/env/prod
terraform state pull > backup-$(date +%Y%m%d).tfstate

# Check out previous version
git checkout {previous-commit}

# Plan and apply
terraform plan
terraform apply
```

## References

- [Azure Monitor Documentation](https://docs.microsoft.com/azure/azure-monitor/)
- [IoT Hub Operations Guide](https://docs.microsoft.com/azure/iot-hub/iot-hub-operations-monitoring)
- [PostgreSQL HA Best Practices](https://docs.microsoft.com/azure/postgresql/flexible-server/concepts-high-availability)

# Azure Infrastructure

This directory contains Terraform configurations for deploying the Industrial Sensor Network infrastructure to Microsoft Azure.

## Prerequisites

- Terraform v1.5 or later
- Azure CLI v2.50 or later
- An Azure subscription
- Appropriate permissions to create resources

## Directory Structure

```
/infra/terraform/
  /modules/           # Reusable Terraform modules
    /iot-hub/         # IoT Hub and DPS
    /backend/         # Backend API hosting
    /web/             # Web app hosting
    /networking/      # VNet, NSG, etc.
    /monitoring/      # App Insights, Log Analytics
    /database/        # PostgreSQL
  /env/               # Environment-specific configurations
    /dev/
    /staging/
    /prod/
```

## Environment Setup

### 1. Install Prerequisites

```bash
# Install Terraform
brew install terraform  # macOS
# or download from https://www.terraform.io/downloads

# Install Azure CLI
brew install azure-cli  # macOS
# or download from https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

# Verify installations
terraform version
az version
```

### 2. Azure Login

```bash
# Login to Azure
az login

# Set subscription (if you have multiple)
az account set --subscription "Your-Subscription-Name"

# Verify
az account show
```

### 3. Configure GitHub Actions (for CI/CD)

The infrastructure uses Azure Federated Identity (OpenID Connect) for GitHub Actions deployment, avoiding long-lived secrets.

```bash
# Run the setup script
cd infra/terraform/scripts
./setup-federated-identity.sh
```

## Deployment

### Development Environment

```bash
cd infra/terraform/env/dev
terraform init
terraform plan
terraform apply
```

### Staging Environment

```bash
cd infra/terraform/env/staging
terraform init
terraform plan
terraform apply
```

### Production Environment

```bash
cd infra/terraform/env/prod
terraform init
terraform plan
# Production requires approval
terraform apply
```

## Deployed Resources

### Core Services
- **Azure IoT Hub**: Device connectivity and messaging
- **Azure DPS**: Zero-touch device provisioning
- **Azure Container Apps**: Backend API hosting
- **Azure Static Web Apps**: Web application hosting
- **Azure Database for PostgreSQL**: Topology and audit data
- **Azure Key Vault**: Secrets management
- **Azure Application Insights**: Observability
- **Azure Log Analytics**: Centralized logging

### Networking
- Virtual Network with subnets
- Network Security Groups
- Private Endpoints for secure connectivity

### Security
- Managed Identity for all services
- RBAC with least privilege
- Private networking where applicable
- Secrets in Key Vault only

## State Management

Terraform state is stored in Azure Storage Account with:
- Encryption at rest
- Versioning enabled
- Lock file for concurrency control

```bash
# Initialize backend (one-time setup per environment)
az storage account create \
  --name "tfstate${ENVIRONMENT}${RANDOM}" \
  --resource-group "rg-tfstate-${ENVIRONMENT}" \
  --location "eastus" \
  --sku Standard_LRS \
  --encryption-services blob

az storage container create \
  --name tfstate \
  --account-name "tfstate${ENVIRONMENT}${RANDOM}"
```

## Outputs

After deployment, Terraform outputs important values:

```bash
# View outputs
terraform output

# Specific output
terraform output iot_hub_connection_string
terraform output web_app_url
terraform output backend_api_url
```

## Drift Detection

Run drift detection to ensure infrastructure matches code:

```bash
cd infra/terraform/env/dev
terraform plan -detailed-exitcode
```

Exit codes:
- 0: No changes
- 1: Error
- 2: Changes detected

## Destroy (Use with Caution)

```bash
cd infra/terraform/env/dev
terraform destroy
```

**WARNING**: This will delete all resources. Production requires additional approval.

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   ```bash
   az login
   az account set --subscription "subscription-id"
   ```

2. **State Lock**
   ```bash
   terraform force-unlock <lock-id>
   ```

3. **Resource Already Exists**
   ```bash
   terraform import <resource-type>.<resource-name> <azure-resource-id>
   ```

## Best Practices

1. **Never commit secrets**: Use Azure Key Vault and managed identities
2. **Use workspaces**: Separate environments (dev/staging/prod)
3. **Version modules**: Tag module releases for stability
4. **Review plans**: Always review `terraform plan` before applying
5. **Automated deployment**: Use GitHub Actions, not local apply
6. **State backup**: Terraform state is backed up automatically in Azure Storage

## References

- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Azure IoT Hub Terraform](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/iothub)
- [Terraform Best Practices](https://www.terraform.io/docs/cloud/guides/recommended-practices/index.html)

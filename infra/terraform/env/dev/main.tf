terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
  
  backend "azurerm" {
    # Backend configuration provided via backend config file
    # terraform init -backend-config=backend.hcl
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy = false
      recover_soft_deleted_key_vaults = true
    }
    
    resource_group {
      prevent_deletion_if_contains_resources = true
    }
  }
}

# Local variables
locals {
  environment = "dev"
  location    = "eastus"
  common_tags = {
    Project     = "Industrial-Sensor-Network"
    Environment = local.environment
    ManagedBy   = "Terraform"
  }
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "rg-industrial-sensor-${local.environment}"
  location = local.location
  tags     = local.common_tags
}

# IoT Hub Module
module "iot_hub" {
  source = "../../modules/iot-hub"
  
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = local.environment
  tags                = local.common_tags
}

# Database Module
module "database" {
  source = "../../modules/database"
  
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = local.environment
  tags                = local.common_tags
}

# Monitoring Module
module "monitoring" {
  source = "../../modules/monitoring"
  
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = local.environment
  tags                = local.common_tags
}

# Backend Module
module "backend" {
  source = "../../modules/backend"
  
  resource_group_name        = azurerm_resource_group.main.name
  location                   = azurerm_resource_group.main.location
  environment                = local.environment
  tags                       = local.common_tags
  database_connection_string = module.database.connection_string
  iot_hub_connection_string  = module.iot_hub.connection_string
  app_insights_key           = module.monitoring.instrumentation_key
}

# Web App Module
module "web" {
  source = "../../modules/web"
  
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = local.environment
  tags                = local.common_tags
  backend_api_url     = module.backend.api_url
}

# Outputs
output "iot_hub_name" {
  value = module.iot_hub.iot_hub_name
}

output "backend_api_url" {
  value = module.backend.api_url
}

output "web_app_url" {
  value = module.web.app_url
}

output "database_host" {
  value = module.database.host
}

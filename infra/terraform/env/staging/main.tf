terraform {
  required_version = ">= 1.5"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
  
  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "tfstatestaging"
    container_name       = "tfstate"
    key                  = "staging.terraform.tfstate"
  }
}

provider "azurerm" {
  features {}
}

locals {
  environment = "staging"
  location    = "eastus"
  tags = {
    Environment = "Staging"
    Project     = "Industrial-IoT-Sensor-Network"
    ManagedBy   = "Terraform"
  }
}

resource "azurerm_resource_group" "main" {
  name     = "rg-industrial-iot-${local.environment}"
  location = local.location
  tags     = local.tags
}

module "iot_hub" {
  source = "../../modules/iot-hub"
  
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = local.environment
  sku_name            = "S1"
  sku_capacity        = 1
  tags                = local.tags
}

module "database" {
  source = "../../modules/database"
  
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  environment              = local.environment
  backup_retention_days    = 14
  geo_redundant_backup     = true
  tags                     = local.tags
}

module "monitoring" {
  source = "../../modules/monitoring"
  
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = local.environment
  retention_in_days   = 60
  tags                = local.tags
}

module "backend" {
  source = "../../modules/backend"
  
  resource_group_name         = azurerm_resource_group.main.name
  location                    = azurerm_resource_group.main.location
  environment                 = local.environment
  min_replicas                = 1
  max_replicas                = 5
  database_connection_string  = module.database.connection_string
  instrumentation_key         = module.monitoring.instrumentation_key
  tags                        = local.tags
}

module "web" {
  source = "../../modules/web"
  
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  environment         = local.environment
  tags                = local.tags
}

output "iot_hub_connection_string" {
  value     = module.iot_hub.connection_string
  sensitive = true
}

output "database_host" {
  value = module.database.host
}

output "backend_url" {
  value = module.backend.url
}

output "web_url" {
  value = module.web.url
}

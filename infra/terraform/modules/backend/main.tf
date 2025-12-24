resource "azurerm_container_app_environment" "main" {
  name                = "cae-industrial-sensor-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location

  tags = var.tags
}

resource "azurerm_container_app" "backend" {
  name                         = "ca-backend-${var.environment}"
  resource_group_name          = var.resource_group_name
  container_app_environment_id = azurerm_container_app_environment.main.id
  revision_mode                = "Single"

  template {
    container {
      name   = "backend-api"
      image  = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest" # Placeholder
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "NODE_ENV"
        value = var.environment
      }

      env {
        name  = "PORT"
        value = "3000"
      }

      env {
        name        = "DB_CONNECTION_STRING"
        secret_name = "db-connection-string"
      }

      env {
        name        = "IOT_HUB_CONNECTION_STRING"
        secret_name = "iot-hub-connection-string"
      }

      env {
        name        = "APPINSIGHTS_INSTRUMENTATIONKEY"
        secret_name = "app-insights-key"
      }
    }

    min_replicas = var.environment == "prod" ? 2 : 1
    max_replicas = var.environment == "prod" ? 10 : 3
  }

  secret {
    name  = "db-connection-string"
    value = var.database_connection_string
  }

  secret {
    name  = "iot-hub-connection-string"
    value = var.iot_hub_connection_string
  }

  secret {
    name  = "app-insights-key"
    value = var.app_insights_key
  }

  ingress {
    external_enabled = true
    target_port      = 3000
    
    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  tags = var.tags
}

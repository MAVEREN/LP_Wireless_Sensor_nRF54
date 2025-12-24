resource "random_password" "pg_password" {
  count   = var.administrator_password == "" ? 1 : 0
  length  = 32
  special = true
}

resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "psql-industrial-sensor-${var.environment}"
  resource_group_name    = var.resource_group_name
  location               = var.location
  version                = "15"
  administrator_login    = var.administrator_login
  administrator_password = var.administrator_password != "" ? var.administrator_password : random_password.pg_password[0].result
  
  storage_mb   = var.storage_mb
  sku_name     = var.sku_name
  
  backup_retention_days        = var.environment == "prod" ? 35 : 7
  geo_redundant_backup_enabled = var.environment == "prod" ? true : false

  tags = var.tags
}

resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = "industrial_sensor"
  server_id = azurerm_postgresql_flexible_server.main.id
  collation = "en_US.utf8"
  charset   = "UTF8"
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

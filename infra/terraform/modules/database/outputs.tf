output "host" {
  value       = azurerm_postgresql_flexible_server.main.fqdn
  description = "PostgreSQL server FQDN"
}

output "database_name" {
  value       = azurerm_postgresql_flexible_server_database.main.name
  description = "Database name"
}

output "administrator_login" {
  value       = azurerm_postgresql_flexible_server.main.administrator_login
  description = "Administrator login"
}

output "connection_string" {
  value       = "postgresql://${azurerm_postgresql_flexible_server.main.administrator_login}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/${azurerm_postgresql_flexible_server_database.main.name}?sslmode=require"
  description = "PostgreSQL connection string"
  sensitive   = true
}

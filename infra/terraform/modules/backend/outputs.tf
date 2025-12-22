output "api_url" {
  value       = "https://${azurerm_container_app.backend.ingress[0].fqdn}"
  description = "Backend API URL"
}

output "app_id" {
  value       = azurerm_container_app.backend.id
  description = "Container App ID"
}

output "app_url" {
  value       = azurerm_static_site.main.default_host_name
  description = "Web app URL"
}

output "api_key" {
  value       = azurerm_static_site.main.api_key
  description = "Static Web App API key for deployment"
  sensitive   = true
}

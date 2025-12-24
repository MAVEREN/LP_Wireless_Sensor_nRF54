output "workspace_id" {
  value       = azurerm_log_analytics_workspace.main.id
  description = "Log Analytics Workspace ID"
}

output "workspace_key" {
  value       = azurerm_log_analytics_workspace.main.primary_shared_key
  description = "Log Analytics Workspace primary key"
  sensitive   = true
}

output "instrumentation_key" {
  value       = azurerm_application_insights.main.instrumentation_key
  description = "Application Insights instrumentation key"
  sensitive   = true
}

output "connection_string" {
  value       = azurerm_application_insights.main.connection_string
  description = "Application Insights connection string"
  sensitive   = true
}

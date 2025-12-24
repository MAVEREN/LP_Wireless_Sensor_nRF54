output "iot_hub_name" {
  value       = azurerm_iothub.main.name
  description = "Name of the IoT Hub"
}

output "iot_hub_id" {
  value       = azurerm_iothub.main.id
  description = "ID of the IoT Hub"
}

output "connection_string" {
  value       = azurerm_iothub.main.shared_access_policy[0].primary_connection_string
  description = "IoT Hub connection string"
  sensitive   = true
}

output "dps_name" {
  value       = azurerm_iothub_dps.main.name
  description = "Name of the Device Provisioning Service"
}

output "dps_id" {
  value       = azurerm_iothub_dps.main.id
  description = "ID of the Device Provisioning Service"
}

output "dps_id_scope" {
  value       = azurerm_iothub_dps.main.id_scope
  description = "DPS ID Scope for device provisioning"
}

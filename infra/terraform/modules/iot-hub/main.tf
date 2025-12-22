resource "azurerm_iothub" "main" {
  name                = "iothub-industrial-sensor-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location

  sku {
    name     = var.iot_hub_sku.name
    capacity = var.iot_hub_sku.capacity
  }

  tags = var.tags
}

resource "azurerm_iothub_dps" "main" {
  name                = "dps-industrial-sensor-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location
  allocation_policy   = "Hashed"

  sku {
    name     = "S1"
    capacity = 1
  }

  tags = var.tags
}

resource "azurerm_iothub_dps_shared_access_policy" "main" {
  name                = "provisioningserviceowner"
  resource_name       = azurerm_iothub_dps.main.name
  resource_group_name = var.resource_group_name

  enrollment_write = true
  enrollment_read  = true
}

resource "azurerm_static_site" "main" {
  name                = "swa-industrial-sensor-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku_tier            = "Standard"
  sku_size            = "Standard"

  tags = var.tags
}

resource "azurerm_static_site_custom_domain" "main" {
  count           = var.environment == "prod" ? 1 : 0
  static_site_id  = azurerm_static_site.main.id
  domain_name     = "sensor.example.com" # Update with actual domain
  validation_type = "dns-txt-token"
}

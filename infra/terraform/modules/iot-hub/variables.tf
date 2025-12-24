variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
}

variable "environment" {
  description = "Environment name (dev/staging/prod)"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

variable "iot_hub_sku" {
  description = "IoT Hub SKU"
  type = object({
    name     = string
    capacity = number
  })
  default = {
    name     = "S1"
    capacity = 1
  }
}

/*
 * GATT Services Implementation - Stub
 */

#include "gatt_services.h"
#include <zephyr/logging/log.h>

LOG_MODULE_REGISTER(gatt_services, LOG_LEVEL_INF);

int gatt_services_init(struct node_config *config)
{
    LOG_INF("GATT services initialized (stub)");
    return 0;
}

int gatt_notify_reading(struct sensor_reading *reading)
{
    LOG_DBG("GATT notification sent: %.2f %s", reading->value, reading->unit);
    return 0;
}

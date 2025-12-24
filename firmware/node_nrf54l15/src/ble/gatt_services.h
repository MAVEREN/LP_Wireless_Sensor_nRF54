/*
 * GATT Services - Stub
 */

#ifndef GATT_SERVICES_H
#define GATT_SERVICES_H

#include "../sensor/sensor_control.h"

int gatt_services_init(struct node_config *config);
int gatt_notify_reading(struct sensor_reading *reading);

#endif /* GATT_SERVICES_H */

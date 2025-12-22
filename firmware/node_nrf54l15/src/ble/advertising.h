/*
 * BLE Advertising - Stub
 */

#ifndef ADVERTISING_H
#define ADVERTISING_H

#include "../sensor/sensor_control.h"

int advertising_start(struct node_config *config);
int advertising_stop(void);
int advertising_update_reading(struct sensor_reading *reading);
int advertising_update_fault_state(void);

#endif /* ADVERTISING_H */

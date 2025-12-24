/*
 * BLE Advertising Implementation - Stub
 */

#include "advertising.h"
#include <zephyr/bluetooth/bluetooth.h>
#include <zephyr/logging/log.h>

LOG_MODULE_REGISTER(advertising, LOG_LEVEL_INF);

int advertising_start(struct node_config *config)
{
    LOG_INF("BLE advertising started (stub)");
    return bt_le_adv_start(BT_LE_ADV_CONN_NAME, NULL, 0, NULL, 0);
}

int advertising_stop(void)
{
    return bt_le_adv_stop();
}

int advertising_update_reading(struct sensor_reading *reading)
{
    LOG_DBG("Advertising updated with reading: %.2f %s", reading->value, reading->unit);
    return 0;
}

int advertising_update_fault_state(void)
{
    LOG_WRN("Advertising updated with fault state");
    return 0;
}

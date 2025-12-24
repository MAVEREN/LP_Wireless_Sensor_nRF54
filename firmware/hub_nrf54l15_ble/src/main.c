/*
 * Hub BLE Central Main Application
 */

#include <zephyr/kernel.h>
#include <zephyr/device.h>
#include <zephyr/drivers/watchdog.h>
#include <zephyr/bluetooth/bluetooth.h>
#include <zephyr/logging/log.h>

#include "scanner.h"
#include "connection_manager.h"

LOG_MODULE_REGISTER(hub_main, LOG_LEVEL_INF);

typedef enum {
    HUB_STATE_INIT,
    HUB_STATE_SCANNING,
    HUB_STATE_IDLE
} hub_state_t;

static hub_state_t hub_state = HUB_STATE_INIT;

static void scan_callback(const struct bt_le_scan_recv_info *info, 
                         struct net_buf_simple *ad_data)
{
    /* Parse advertisement */
    LOG_DBG("Node advertisement received, RSSI: %d", info->rssi);
}

static struct k_work_delayable scan_work;

static void scan_work_handler(struct k_work *work)
{
    int ret;
    
    LOG_INF("Starting scan cycle");
    hub_state = HUB_STATE_SCANNING;
    
    ret = scanner_start(scan_callback);
    if (ret < 0) {
        LOG_ERR("Scan failed: %d", ret);
        hub_state = HUB_STATE_IDLE;
        k_work_reschedule(&scan_work, K_SECONDS(30));
        return;
    }
    
    k_sleep(K_SECONDS(5));
    scanner_stop();
    
    hub_state = HUB_STATE_IDLE;
    k_work_reschedule(&scan_work, K_SECONDS(30));
}

int main(void)
{
    int ret;
    
    LOG_INF("Hub BLE Central starting...");
    
    ret = bt_enable(NULL);
    if (ret) {
        LOG_ERR("Bluetooth init failed (err %d)", ret);
        return ret;
    }
    
    ret = scanner_init();
    if (ret) {
        LOG_ERR("Scanner init failed");
        return ret;
    }
    
    ret = connection_manager_init();
    if (ret) {
        LOG_ERR("Connection manager init failed");
        return ret;
    }
    
    k_work_init_delayable(&scan_work, scan_work_handler);
    k_work_schedule(&scan_work, K_SECONDS(5));
    
    LOG_INF("Hub BLE Central initialized");
    
    while (1) {
        k_sleep(K_SECONDS(5));
        LOG_DBG("Hub state: %d", hub_state);
    }
    
    return 0;
}

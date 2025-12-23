/*
 * BLE Scanner Implementation
 */

#include "scanner.h"
#include <zephyr/logging/log.h>

LOG_MODULE_REGISTER(scanner, LOG_LEVEL_DBG);

static scan_callback_t scan_cb;
static bool scanning = false;

static struct bt_le_scan_param scan_param = {
    .type = BT_LE_SCAN_TYPE_PASSIVE,
    .options = BT_LE_SCAN_OPT_FILTER_DUPLICATE,
    .interval = BT_GAP_SCAN_FAST_INTERVAL,
    .window = BT_GAP_SCAN_FAST_WINDOW,
};

static void device_found(const bt_addr_le_t *addr, int8_t rssi, uint8_t type,
                        struct net_buf_simple *ad)
{
    if (!scan_cb) {
        return;
    }
    
    struct bt_le_scan_recv_info info = {
        .addr = addr,
        .rssi = rssi,
        .adv_type = type,
    };
    
    scan_cb(&info, ad);
}

int scanner_init(void)
{
    LOG_INF("Scanner initialized");
    return 0;
}

int scanner_start(scan_callback_t callback)
{
    int ret;
    
    if (scanning) {
        return -EALREADY;
    }
    
    if (!callback) {
        return -EINVAL;
    }
    
    scan_cb = callback;
    
    ret = bt_le_scan_start(&scan_param, device_found);
    if (ret) {
        LOG_ERR("Scan start failed (err %d)", ret);
        return ret;
    }
    
    scanning = true;
    LOG_INF("Scanning started");
    
    return 0;
}

int scanner_stop(void)
{
    if (!scanning) {
        return 0;
    }
    
    int ret = bt_le_scan_stop();
    if (ret) {
        LOG_ERR("Scan stop failed (err %d)", ret);
        return ret;
    }
    
    scanning = false;
    scan_cb = NULL;
    LOG_INF("Scanning stopped");
    
    return 0;
}

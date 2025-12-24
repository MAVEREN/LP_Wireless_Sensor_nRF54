/*
 * BLE Scanner for Node Discovery
 */

#ifndef SCANNER_H
#define SCANNER_H

#include <zephyr/bluetooth/bluetooth.h>
#include <zephyr/bluetooth/gap.h>

typedef void (*scan_callback_t)(const struct bt_le_scan_recv_info *info,
                                struct net_buf_simple *ad_data);

int scanner_init(void);
int scanner_start(scan_callback_t callback);
int scanner_stop(void);

#endif /* SCANNER_H */

/*
 * BLE Connection Manager
 */

#ifndef CONNECTION_MANAGER_H
#define CONNECTION_MANAGER_H

#include <zephyr/bluetooth/conn.h>

#define MAX_CONNECTIONS 3

int connection_manager_init(void);
struct bt_conn *connection_manager_connect(const bt_addr_le_t *addr, uint32_t timeout_sec);
int connection_manager_disconnect(struct bt_conn *conn);
int connection_manager_get_count(void);

#endif /* CONNECTION_MANAGER_H */

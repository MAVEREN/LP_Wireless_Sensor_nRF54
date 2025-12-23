/*
 * BLE Connection Manager Implementation
 */

#include "connection_manager.h"
#include <zephyr/logging/log.h>
#include <string.h>

LOG_MODULE_REGISTER(conn_mgr, LOG_LEVEL_INF);

struct connection_entry {
    struct bt_conn *conn;
    bool in_use;
};

static struct connection_entry connections[MAX_CONNECTIONS];
static struct k_mutex conn_mutex;

static void connected_cb(struct bt_conn *conn, uint8_t err)
{
    if (err) {
        LOG_ERR("Connection failed (err %u)", err);
        return;
    }
    LOG_INF("Connected");
}

static void disconnected_cb(struct bt_conn *conn, uint8_t reason)
{
    LOG_INF("Disconnected (reason %u)", reason);
    
    k_mutex_lock(&conn_mutex, K_FOREVER);
    for (int i = 0; i < MAX_CONNECTIONS; i++) {
        if (connections[i].conn == conn) {
            bt_conn_unref(conn);
            connections[i].conn = NULL;
            connections[i].in_use = false;
            break;
        }
    }
    k_mutex_unlock(&conn_mutex);
}

static struct bt_conn_cb conn_callbacks = {
    .connected = connected_cb,
    .disconnected = disconnected_cb,
};

int connection_manager_init(void)
{
    k_mutex_init(&conn_mutex);
    memset(connections, 0, sizeof(connections));
    bt_conn_cb_register(&conn_callbacks);
    
    LOG_INF("Connection manager initialized");
    return 0;
}

struct bt_conn *connection_manager_connect(const bt_addr_le_t *addr, uint32_t timeout_sec)
{
    struct bt_conn *conn;
    int err, slot = -1;
    
    k_mutex_lock(&conn_mutex, K_FOREVER);
    for (int i = 0; i < MAX_CONNECTIONS; i++) {
        if (!connections[i].in_use) {
            slot = i;
            connections[i].in_use = true;
            break;
        }
    }
    k_mutex_unlock(&conn_mutex);
    
    if (slot < 0) {
        LOG_ERR("No free connection slots");
        return NULL;
    }
    
    struct bt_le_conn_param param = {
        .interval_min = BT_GAP_INIT_CONN_INT_MIN,
        .interval_max = BT_GAP_INIT_CONN_INT_MAX,
        .latency = 0,
        .timeout = 400,
    };
    
    err = bt_conn_le_create(addr, BT_CONN_LE_CREATE_CONN, &param, &conn);
    if (err) {
        LOG_ERR("Create conn failed (err %d)", err);
        k_mutex_lock(&conn_mutex, K_FOREVER);
        connections[slot].in_use = false;
        k_mutex_unlock(&conn_mutex);
        return NULL;
    }
    
    k_mutex_lock(&conn_mutex, K_FOREVER);
    connections[slot].conn = conn;
    k_mutex_unlock(&conn_mutex);
    
    LOG_INF("Connection initiated");
    return conn;
}

int connection_manager_disconnect(struct bt_conn *conn)
{
    if (!conn) {
        return -EINVAL;
    }
    
    return bt_conn_disconnect(conn, BT_HCI_ERR_REMOTE_USER_TERM_CONN);
}

int connection_manager_get_count(void)
{
    int count = 0;
    
    k_mutex_lock(&conn_mutex, K_FOREVER);
    for (int i = 0; i < MAX_CONNECTIONS; i++) {
        if (connections[i].in_use) {
            count++;
        }
    }
    k_mutex_unlock(&conn_mutex);
    
    return count;
}

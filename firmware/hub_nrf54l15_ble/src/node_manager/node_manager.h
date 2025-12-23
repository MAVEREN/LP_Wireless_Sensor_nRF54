/**
 * @file node_manager.h
 * @brief Node management for Hub BLE Central
 */

#ifndef NODE_MANAGER_H
#define NODE_MANAGER_H

#include <zephyr/bluetooth/bluetooth.h>
#include <stdint.h>
#include <stdbool.h>

#define MAX_NODES 32
#define NODE_ID_LEN 16

enum node_state {
	NODE_STATE_DISCOVERED,
	NODE_STATE_CONNECTED,
	NODE_STATE_BOUND,
	NODE_STATE_FAULT,
	NODE_STATE_DISCONNECTED
};

struct node_info {
	bool valid;
	uint8_t node_id[NODE_ID_LEN];
	bt_addr_le_t addr;
	enum node_state state;
	struct bt_conn *conn;
	int8_t rssi;
	uint32_t last_seen;
	uint8_t battery_level;
	float latest_reading;
	uint32_t fault_flags;
	uint16_t sampling_interval;
	bool bound_to_hub;
	char name[32];
	uint32_t firmware_version;
};

int node_manager_init(void);
int node_manager_add_node(const bt_addr_le_t *addr, int8_t rssi,
                          const uint8_t *adv_data, uint8_t len);
struct node_info *node_manager_get_by_addr(const bt_addr_le_t *addr);
struct node_info *node_manager_get_by_id(const uint8_t *node_id);
struct node_info *node_manager_get_by_index(int index);
int node_manager_update_connection(const bt_addr_le_t *addr, struct bt_conn *conn);
int node_manager_update_reading(const bt_addr_le_t *addr, float reading);
int node_manager_update_battery(const bt_addr_le_t *addr, uint8_t battery_level);
int node_manager_update_faults(const bt_addr_le_t *addr, uint32_t fault_flags);
int node_manager_bind_node(const bt_addr_le_t *addr);
int node_manager_unbind_node(const bt_addr_le_t *addr);
int node_manager_get_count(void);
int node_manager_get_connected_count(void);
int node_manager_clear_stale(uint32_t timeout_ms);

#endif /* NODE_MANAGER_H */

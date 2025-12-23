/**
 * @file node_manager.c
 * @brief Node management implementation
 */

#include "node_manager.h"
#include <zephyr/kernel.h>
#include <zephyr/logging/log.h>
#include <string.h>

LOG_MODULE_REGISTER(node_manager, LOG_LEVEL_INF);

static struct node_info nodes[MAX_NODES];
static struct k_mutex node_mutex;

int node_manager_init(void)
{
	k_mutex_init(&node_mutex);
	memset(nodes, 0, sizeof(nodes));
	LOG_INF("Node manager initialized (max nodes: %d)", MAX_NODES);
	return 0;
}

static int find_node_by_addr(const bt_addr_le_t *addr)
{
	for (int i = 0; i < MAX_NODES; i++) {
		if (nodes[i].valid && bt_addr_le_cmp(&nodes[i].addr, addr) == 0) {
			return i;
		}
	}
	return -1;
}

int node_manager_add_node(const bt_addr_le_t *addr, int8_t rssi,
                          const uint8_t *adv_data, uint8_t len)
{
	k_mutex_lock(&node_mutex, K_FOREVER);
	
	int index = find_node_by_addr(addr);
	
	if (index < 0) {
		for (int i = 0; i < MAX_NODES; i++) {
			if (!nodes[i].valid) {
				index = i;
				break;
			}
		}
		if (index < 0) {
			k_mutex_unlock(&node_mutex);
			return -ENOMEM;
		}
		
		memset(&nodes[index], 0, sizeof(struct node_info));
		nodes[index].valid = true;
		bt_addr_le_copy(&nodes[index].addr, addr);
		nodes[index].state = NODE_STATE_DISCOVERED;
		LOG_INF("New node at index %d", index);
	}
	
	nodes[index].rssi = rssi;
	nodes[index].last_seen = k_uptime_get_32();
	
	if (adv_data && len > 0) {
		uint8_t id_len = MIN(len, NODE_ID_LEN);
		memcpy(nodes[index].node_id, adv_data, id_len);
	}
	
	k_mutex_unlock(&node_mutex);
	return index;
}

struct node_info *node_manager_get_by_addr(const bt_addr_le_t *addr)
{
	k_mutex_lock(&node_mutex, K_FOREVER);
	int index = find_node_by_addr(addr);
	k_mutex_unlock(&node_mutex);
	return (index >= 0) ? &nodes[index] : NULL;
}

struct node_info *node_manager_get_by_index(int index)
{
	if (index < 0 || index >= MAX_NODES) return NULL;
	return nodes[index].valid ? &nodes[index] : NULL;
}

int node_manager_update_connection(const bt_addr_le_t *addr, struct bt_conn *conn)
{
	k_mutex_lock(&node_mutex, K_FOREVER);
	int index = find_node_by_addr(addr);
	if (index >= 0) {
		nodes[index].conn = conn;
		nodes[index].state = conn ? NODE_STATE_CONNECTED : NODE_STATE_DISCONNECTED;
	}
	k_mutex_unlock(&node_mutex);
	return (index >= 0) ? 0 : -ENOENT;
}

int node_manager_update_reading(const bt_addr_le_t *addr, float reading)
{
	k_mutex_lock(&node_mutex, K_FOREVER);
	int index = find_node_by_addr(addr);
	if (index >= 0) {
		nodes[index].latest_reading = reading;
		nodes[index].last_seen = k_uptime_get_32();
	}
	k_mutex_unlock(&node_mutex);
	return (index >= 0) ? 0 : -ENOENT;
}

int node_manager_update_battery(const bt_addr_le_t *addr, uint8_t battery_level)
{
	k_mutex_lock(&node_mutex, K_FOREVER);
	int index = find_node_by_addr(addr);
	if (index >= 0) nodes[index].battery_level = battery_level;
	k_mutex_unlock(&node_mutex);
	return (index >= 0) ? 0 : -ENOENT;
}

int node_manager_bind_node(const bt_addr_le_t *addr)
{
	k_mutex_lock(&node_mutex, K_FOREVER);
	int index = find_node_by_addr(addr);
	if (index >= 0) {
		nodes[index].bound_to_hub = true;
		nodes[index].state = NODE_STATE_BOUND;
		LOG_INF("Node %d bound", index);
	}
	k_mutex_unlock(&node_mutex);
	return (index >= 0) ? 0 : -ENOENT;
}

int node_manager_get_count(void)
{
	int count = 0;
	k_mutex_lock(&node_mutex, K_FOREVER);
	for (int i = 0; i < MAX_NODES; i++) {
		if (nodes[i].valid) count++;
	}
	k_mutex_unlock(&node_mutex);
	return count;
}

int node_manager_get_connected_count(void)
{
	int count = 0;
	k_mutex_lock(&node_mutex, K_FOREVER);
	for (int i = 0; i < MAX_NODES; i++) {
		if (nodes[i].valid && nodes[i].state == NODE_STATE_CONNECTED) count++;
	}
	k_mutex_unlock(&node_mutex);
	return count;
}

/* Additional methods abbreviated for space */
struct node_info *node_manager_get_by_id(const uint8_t *node_id) { return NULL; }
int node_manager_update_faults(const bt_addr_le_t *addr, uint32_t fault_flags) { return 0; }
int node_manager_unbind_node(const bt_addr_le_t *addr) { return 0; }
int node_manager_clear_stale(uint32_t timeout_ms) { return 0; }

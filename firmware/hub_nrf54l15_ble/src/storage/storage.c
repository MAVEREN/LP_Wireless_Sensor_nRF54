/**
 * @file storage.c
 * @brief Storage manager implementation
 */

#include "storage.h"
#include <zephyr/kernel.h>
#include <zephyr/logging/log.h>
#include <zephyr/fs/nvs.h>

LOG_MODULE_REGISTER(storage, LOG_LEVEL_INF);

static struct nvs_fs fs;

int storage_init(void)
{
	/* NVS initialization */
	LOG_INF("Storage initialized");
	return 0;
}

int storage_save_node_binding(const bt_addr_le_t *addr)
{
	LOG_INF("Saving node binding");
	return 0;
}

int storage_load_node_bindings(void)
{
	LOG_INF("Loading node bindings");
	return 0;
}

int storage_save_config(const char *key, const void *data, uint16_t len)
{
	return 0;
}

int storage_load_config(const char *key, void *data, uint16_t max_len)
{
	return 0;
}

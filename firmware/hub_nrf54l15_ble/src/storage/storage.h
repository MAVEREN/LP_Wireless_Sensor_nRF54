/**
 * @file storage.h
 * @brief Storage manager for Hub BLE Central
 */

#ifndef STORAGE_H
#define STORAGE_H

#include <stdint.h>
#include <zephyr/bluetooth/bluetooth.h>

int storage_init(void);
int storage_save_node_binding(const bt_addr_le_t *addr);
int storage_load_node_bindings(void);
int storage_save_config(const char *key, const void *data, uint16_t len);
int storage_load_config(const char *key, void *data, uint16_t max_len);

#endif /* STORAGE_H */

/**
 * @file gatt_client.h
 * @brief GATT Client operations for Hub BLE Central
 * 
 * Handles GATT service/characteristic discovery, read/write operations,
 * and notification subscriptions for sensor nodes.
 */

#ifndef GATT_CLIENT_H
#define GATT_CLIENT_H

#include <zephyr/bluetooth/bluetooth.h>
#include <zephyr/bluetooth/gatt.h>
#include <zephyr/bluetooth/uuid.h>

/* GATT operation result codes */
#define GATT_OP_SUCCESS         0
#define GATT_OP_FAILED          -1
#define GATT_OP_TIMEOUT         -2
#define GATT_OP_NOT_FOUND       -3

/* Service UUIDs */
#define SENSOR_SERVICE_UUID     BT_UUID_128_ENCODE(0x00001000, 0x0000, 0x1000, 0x8000, 0x00805f9b34fb)

/* Characteristic UUIDs */
#define READING_CHAR_UUID       BT_UUID_128_ENCODE(0x00001001, 0x0000, 0x1000, 0x8000, 0x00805f9b34fb)
#define BATTERY_CHAR_UUID       BT_UUID_128_ENCODE(0x00001002, 0x0000, 0x1000, 0x8000, 0x00805f9b34fb)
#define CONFIG_CHAR_UUID        BT_UUID_128_ENCODE(0x00001003, 0x0000, 0x1000, 0x8000, 0x00805f9b34fb)
#define CALIBRATION_CHAR_UUID   BT_UUID_128_ENCODE(0x00001004, 0x0000, 0x1000, 0x8000, 0x00805f9b34fb)
#define DIAGNOSTICS_CHAR_UUID   BT_UUID_128_ENCODE(0x00001005, 0x0000, 0x1000, 0x8000, 0x00805f9b34fb)

/* Callbacks */
typedef void (*gatt_discover_cb_t)(struct bt_conn *conn, int status);
typedef void (*gatt_read_cb_t)(struct bt_conn *conn, int status, const void *data, uint16_t length);
typedef void (*gatt_write_cb_t)(struct bt_conn *conn, int status);
typedef void (*gatt_notify_cb_t)(struct bt_conn *conn, const void *data, uint16_t length);

/* GATT client context */
struct gatt_client_ctx {
	struct bt_conn *conn;
	struct bt_gatt_discover_params discover_params;
	struct bt_gatt_read_params read_params;
	struct bt_gatt_write_params write_params;
	struct bt_gatt_subscribe_params subscribe_params;
	
	uint16_t reading_handle;
	uint16_t battery_handle;
	uint16_t config_handle;
	uint16_t calibration_handle;
	uint16_t diagnostics_handle;
	
	gatt_discover_cb_t discover_cb;
	gatt_read_cb_t read_cb;
	gatt_write_cb_t write_cb;
	gatt_notify_cb_t notify_cb;
};

/**
 * @brief Initialize GATT client
 * @return 0 on success, negative error code on failure
 */
int gatt_client_init(void);

/**
 * @brief Discover services and characteristics
 * @param conn Connection handle
 * @param cb Callback when discovery complete
 * @return 0 on success, negative error code on failure
 */
int gatt_client_discover(struct bt_conn *conn, gatt_discover_cb_t cb);

/**
 * @brief Read characteristic value
 * @param conn Connection handle
 * @param uuid Characteristic UUID
 * @param cb Callback with read data
 * @return 0 on success, negative error code on failure
 */
int gatt_client_read(struct bt_conn *conn, const struct bt_uuid *uuid, gatt_read_cb_t cb);

/**
 * @brief Write characteristic value
 * @param conn Connection handle
 * @param uuid Characteristic UUID
 * @param data Data to write
 * @param length Data length
 * @param cb Callback when write complete
 * @return 0 on success, negative error code on failure
 */
int gatt_client_write(struct bt_conn *conn, const struct bt_uuid *uuid,
                      const void *data, uint16_t length, gatt_write_cb_t cb);

/**
 * @brief Subscribe to characteristic notifications
 * @param conn Connection handle
 * @param uuid Characteristic UUID
 * @param cb Callback for notification data
 * @return 0 on success, negative error code on failure
 */
int gatt_client_subscribe(struct bt_conn *conn, const struct bt_uuid *uuid,
                          gatt_notify_cb_t cb);

/**
 * @brief Unsubscribe from notifications
 * @param conn Connection handle
 * @param uuid Characteristic UUID
 * @return 0 on success, negative error code on failure
 */
int gatt_client_unsubscribe(struct bt_conn *conn, const struct bt_uuid *uuid);

#endif /* GATT_CLIENT_H */

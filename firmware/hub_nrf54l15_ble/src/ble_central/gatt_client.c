/**
 * @file gatt_client.c
 * @brief GATT Client implementation for Hub BLE Central
 */

#include "gatt_client.h"
#include <zephyr/kernel.h>
#include <zephyr/logging/log.h>
#include <string.h>

LOG_MODULE_REGISTER(gatt_client, LOG_LEVEL_INF);

#define MAX_GATT_CONTEXTS 3

static struct gatt_client_ctx gatt_contexts[MAX_GATT_CONTEXTS];
static struct k_mutex gatt_mutex;

/* Forward declarations */
static uint8_t discover_func(struct bt_conn *conn, const struct bt_gatt_attr *attr,
                             struct bt_gatt_discover_params *params);
static uint8_t read_func(struct bt_conn *conn, uint8_t err,
                        struct bt_gatt_read_params *params, const void *data, uint16_t length);
static uint8_t notify_func(struct bt_conn *conn, struct bt_gatt_subscribe_params *params,
                          const void *data, uint16_t length);

int gatt_client_init(void)
{
	k_mutex_init(&gatt_mutex);
	memset(gatt_contexts, 0, sizeof(gatt_contexts));
	LOG_INF("GATT client initialized");
	return 0;
}

static struct gatt_client_ctx *get_context(struct bt_conn *conn)
{
	k_mutex_lock(&gatt_mutex, K_FOREVER);
	
	for (int i = 0; i < MAX_GATT_CONTEXTS; i++) {
		if (gatt_contexts[i].conn == conn) {
			k_mutex_unlock(&gatt_mutex);
			return &gatt_contexts[i];
		}
	}
	
	/* Find free context */
	for (int i = 0; i < MAX_GATT_CONTEXTS; i++) {
		if (gatt_contexts[i].conn == NULL) {
			gatt_contexts[i].conn = conn;
			k_mutex_unlock(&gatt_mutex);
			return &gatt_contexts[i];
		}
	}
	
	k_mutex_unlock(&gatt_mutex);
	return NULL;
}

static void release_context(struct bt_conn *conn)
{
	k_mutex_lock(&gatt_mutex, K_FOREVER);
	
	for (int i = 0; i < MAX_GATT_CONTEXTS; i++) {
		if (gatt_contexts[i].conn == conn) {
			memset(&gatt_contexts[i], 0, sizeof(struct gatt_client_ctx));
			break;
		}
	}
	
	k_mutex_unlock(&gatt_mutex);
}

static uint8_t discover_func(struct bt_conn *conn, const struct bt_gatt_attr *attr,
                             struct bt_gatt_discover_params *params)
{
	struct gatt_client_ctx *ctx = get_context(conn);
	
	if (!attr) {
		LOG_INF("Discovery complete");
		if (ctx && ctx->discover_cb) {
			ctx->discover_cb(conn, 0);
		}
		return BT_GATT_ITER_STOP;
	}
	
	if (!ctx) {
		return BT_GATT_ITER_STOP;
	}
	
	/* Store characteristic handles based on UUID */
	struct bt_gatt_chrc *chrc = (struct bt_gatt_chrc *)attr->user_data;
	
	if (bt_uuid_cmp(chrc->uuid, BT_UUID_DECLARE_128(READING_CHAR_UUID)) == 0) {
		ctx->reading_handle = chrc->value_handle;
		LOG_INF("Found reading characteristic handle: %u", ctx->reading_handle);
	} else if (bt_uuid_cmp(chrc->uuid, BT_UUID_DECLARE_128(BATTERY_CHAR_UUID)) == 0) {
		ctx->battery_handle = chrc->value_handle;
		LOG_INF("Found battery characteristic handle: %u", ctx->battery_handle);
	} else if (bt_uuid_cmp(chrc->uuid, BT_UUID_DECLARE_128(CONFIG_CHAR_UUID)) == 0) {
		ctx->config_handle = chrc->value_handle;
		LOG_INF("Found config characteristic handle: %u", ctx->config_handle);
	} else if (bt_uuid_cmp(chrc->uuid, BT_UUID_DECLARE_128(CALIBRATION_CHAR_UUID)) == 0) {
		ctx->calibration_handle = chrc->value_handle;
		LOG_INF("Found calibration characteristic handle: %u", ctx->calibration_handle);
	} else if (bt_uuid_cmp(chrc->uuid, BT_UUID_DECLARE_128(DIAGNOSTICS_CHAR_UUID)) == 0) {
		ctx->diagnostics_handle = chrc->value_handle;
		LOG_INF("Found diagnostics characteristic handle: %u", ctx->diagnostics_handle);
	}
	
	return BT_GATT_ITER_CONTINUE;
}

int gatt_client_discover(struct bt_conn *conn, gatt_discover_cb_t cb)
{
	struct gatt_client_ctx *ctx = get_context(conn);
	
	if (!ctx) {
		LOG_ERR("No context available");
		return -ENOMEM;
	}
	
	ctx->discover_cb = cb;
	ctx->discover_params.uuid = BT_UUID_DECLARE_128(SENSOR_SERVICE_UUID);
	ctx->discover_params.func = discover_func;
	ctx->discover_params.start_handle = BT_ATT_FIRST_ATTRIBUTE_HANDLE;
	ctx->discover_params.end_handle = BT_ATT_LAST_ATTRIBUTE_HANDLE;
	ctx->discover_params.type = BT_GATT_DISCOVER_CHARACTERISTIC;
	
	int err = bt_gatt_discover(conn, &ctx->discover_params);
	if (err) {
		LOG_ERR("Discover failed: %d", err);
		return err;
	}
	
	LOG_INF("Discovery started");
	return 0;
}

static uint8_t read_func(struct bt_conn *conn, uint8_t err,
                        struct bt_gatt_read_params *params, const void *data, uint16_t length)
{
	struct gatt_client_ctx *ctx = get_context(conn);
	
	if (!ctx) {
		return BT_GATT_ITER_STOP;
	}
	
	if (err) {
		LOG_ERR("Read failed: %u", err);
		if (ctx->read_cb) {
			ctx->read_cb(conn, err, NULL, 0);
		}
		return BT_GATT_ITER_STOP;
	}
	
	if (!data) {
		LOG_INF("Read complete");
		return BT_GATT_ITER_STOP;
	}
	
	if (ctx->read_cb) {
		ctx->read_cb(conn, 0, data, length);
	}
	
	return BT_GATT_ITER_CONTINUE;
}

int gatt_client_read(struct bt_conn *conn, const struct bt_uuid *uuid, gatt_read_cb_t cb)
{
	struct gatt_client_ctx *ctx = get_context(conn);
	
	if (!ctx) {
		return -ENOMEM;
	}
	
	uint16_t handle = 0;
	
	if (bt_uuid_cmp(uuid, BT_UUID_DECLARE_128(READING_CHAR_UUID)) == 0) {
		handle = ctx->reading_handle;
	} else if (bt_uuid_cmp(uuid, BT_UUID_DECLARE_128(BATTERY_CHAR_UUID)) == 0) {
		handle = ctx->battery_handle;
	} else if (bt_uuid_cmp(uuid, BT_UUID_DECLARE_128(CONFIG_CHAR_UUID)) == 0) {
		handle = ctx->config_handle;
	} else if (bt_uuid_cmp(uuid, BT_UUID_DECLARE_128(DIAGNOSTICS_CHAR_UUID)) == 0) {
		handle = ctx->diagnostics_handle;
	}
	
	if (handle == 0) {
		LOG_ERR("Characteristic not found");
		return -ENOENT;
	}
	
	ctx->read_cb = cb;
	ctx->read_params.func = read_func;
	ctx->read_params.handle_count = 1;
	ctx->read_params.single.handle = handle;
	ctx->read_params.single.offset = 0;
	
	int err = bt_gatt_read(conn, &ctx->read_params);
	if (err) {
		LOG_ERR("Read failed: %d", err);
		return err;
	}
	
	return 0;
}

int gatt_client_write(struct bt_conn *conn, const struct bt_uuid *uuid,
                      const void *data, uint16_t length, gatt_write_cb_t cb)
{
	struct gatt_client_ctx *ctx = get_context(conn);
	
	if (!ctx) {
		return -ENOMEM;
	}
	
	uint16_t handle = 0;
	
	if (bt_uuid_cmp(uuid, BT_UUID_DECLARE_128(CONFIG_CHAR_UUID)) == 0) {
		handle = ctx->config_handle;
	} else if (bt_uuid_cmp(uuid, BT_UUID_DECLARE_128(CALIBRATION_CHAR_UUID)) == 0) {
		handle = ctx->calibration_handle;
	}
	
	if (handle == 0) {
		LOG_ERR("Characteristic not found or not writable");
		return -ENOENT;
	}
	
	ctx->write_cb = cb;
	ctx->write_params.func = NULL; /* Synchronous write */
	ctx->write_params.handle = handle;
	ctx->write_params.offset = 0;
	ctx->write_params.data = data;
	ctx->write_params.length = length;
	
	int err = bt_gatt_write(conn, &ctx->write_params);
	if (err) {
		LOG_ERR("Write failed: %d", err);
		return err;
	}
	
	if (cb) {
		cb(conn, 0);
	}
	
	return 0;
}

static uint8_t notify_func(struct bt_conn *conn, struct bt_gatt_subscribe_params *params,
                          const void *data, uint16_t length)
{
	struct gatt_client_ctx *ctx = get_context(conn);
	
	if (!ctx) {
		return BT_GATT_ITER_STOP;
	}
	
	if (!data) {
		LOG_INF("Unsubscribed");
		params->value_handle = 0;
		return BT_GATT_ITER_STOP;
	}
	
	if (ctx->notify_cb) {
		ctx->notify_cb(conn, data, length);
	}
	
	return BT_GATT_ITER_CONTINUE;
}

int gatt_client_subscribe(struct bt_conn *conn, const struct bt_uuid *uuid,
                          gatt_notify_cb_t cb)
{
	struct gatt_client_ctx *ctx = get_context(conn);
	
	if (!ctx) {
		return -ENOMEM;
	}
	
	uint16_t handle = 0;
	
	if (bt_uuid_cmp(uuid, BT_UUID_DECLARE_128(READING_CHAR_UUID)) == 0) {
		handle = ctx->reading_handle;
	}
	
	if (handle == 0) {
		LOG_ERR("Characteristic not found or not notifiable");
		return -ENOENT;
	}
	
	ctx->notify_cb = cb;
	ctx->subscribe_params.notify = notify_func;
	ctx->subscribe_params.value = BT_GATT_CCC_NOTIFY;
	ctx->subscribe_params.value_handle = handle;
	ctx->subscribe_params.ccc_handle = handle + 1; /* Assume CCC is next handle */
	
	int err = bt_gatt_subscribe(conn, &ctx->subscribe_params);
	if (err) {
		LOG_ERR("Subscribe failed: %d", err);
		return err;
	}
	
	return 0;
}

int gatt_client_unsubscribe(struct bt_conn *conn, const struct bt_uuid *uuid)
{
	struct gatt_client_ctx *ctx = get_context(conn);
	
	if (!ctx) {
		return -ENOMEM;
	}
	
	int err = bt_gatt_unsubscribe(conn, &ctx->subscribe_params);
	if (err) {
		LOG_ERR("Unsubscribe failed: %d", err);
		return err;
	}
	
	release_context(conn);
	return 0;
}

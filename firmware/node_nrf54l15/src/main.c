/*
 * Industrial Sensor Node - Main Application
 * 
 * This firmware implements an ultra-low-power BLE sensor node for industrial
 * 0-5V ratiometric sensors. Features include:
 * - Sensor power gating for extreme low power
 * - Configurable sampling and calibration
 * - BLE advertising and GATT services
 * - Secure configuration and firmware update
 */

#include <zephyr/kernel.h>
#include <zephyr/device.h>
#include <zephyr/devicetree.h>
#include <zephyr/drivers/gpio.h>
#include <zephyr/drivers/adc.h>
#include <zephyr/bluetooth/bluetooth.h>
#include <zephyr/bluetooth/hci.h>
#include <zephyr/bluetooth/conn.h>
#include <zephyr/bluetooth/uuid.h>
#include <zephyr/bluetooth/gatt.h>
#include <zephyr/logging/log.h>
#include <zephyr/drivers/watchdog.h>

#include "sensor/sensor_control.h"
#include "ble/advertising.h"
#include "ble/gatt_services.h"
#include "config/config_manager.h"
#include "power/power_manager.h"
#include "diagnostics/diagnostics.h"

LOG_MODULE_REGISTER(main, LOG_LEVEL_INF);

/* Application state */
static enum {
    STATE_FACTORY,
    STATE_UNCOMMISSIONED,
    STATE_COMMISSIONING,
    STATE_OPERATIONAL,
    STATE_MAINTENANCE,
    STATE_FAULT
} app_state = STATE_UNCOMMISSIONED;

/* Work queue for sensor sampling */
static struct k_work_delayable sample_work;

/* Watchdog device */
static const struct device *wdt_dev;
static int wdt_channel_id;

/* Application configuration */
static struct node_config current_config;

/**
 * Sensor sampling work handler
 */
static void sample_work_handler(struct k_work *work)
{
    int ret;
    struct sensor_reading reading;

    LOG_INF("Starting sensor sample cycle");

    /* Feed watchdog */
    if (wdt_dev) {
        wdt_feed(wdt_dev, wdt_channel_id);
    }

    /* Read sensor */
    ret = sensor_read(&current_config, &reading);
    if (ret < 0) {
        LOG_ERR("Sensor read failed: %d", ret);
        diagnostics_record_fault(FAULT_SENSOR_READ_FAILED);
        
        /* Enter fault state if too many consecutive failures */
        if (diagnostics_get_fault_count() > 5) {
            app_state = STATE_FAULT;
        }
    } else {
        LOG_INF("Reading: %.2f %s (raw: %d)", 
                reading.value, reading.unit, reading.raw_value);
        
        /* Update advertisement data */
        advertising_update_reading(&reading);
        
        /* Send notification if connected */
        gatt_notify_reading(&reading);
        
        /* Clear fault counter on successful read */
        diagnostics_clear_fault_count();
    }

    /* Schedule next sample */
    if (app_state == STATE_OPERATIONAL) {
        k_work_schedule(&sample_work, 
                       K_SECONDS(current_config.sampling.interval_seconds));
    }
}

/**
 * Initialize watchdog
 */
static int init_watchdog(void)
{
    int ret;
    struct wdt_timeout_cfg wdt_config = {
        .flags = WDT_FLAG_RESET_SOC,
        .window.min = 0,
        .window.max = 30000, /* 30 seconds */
        .callback = NULL,
    };

    wdt_dev = DEVICE_DT_GET(DT_NODELABEL(wdt0));
    if (!device_is_ready(wdt_dev)) {
        LOG_ERR("Watchdog device not ready");
        return -ENODEV;
    }

    wdt_channel_id = wdt_install_timeout(wdt_dev, &wdt_config);
    if (wdt_channel_id < 0) {
        LOG_ERR("Watchdog install failed: %d", wdt_channel_id);
        return wdt_channel_id;
    }

    ret = wdt_setup(wdt_dev, WDT_OPT_PAUSE_HALTED_BY_DBG);
    if (ret < 0) {
        LOG_ERR("Watchdog setup failed: %d", ret);
        return ret;
    }

    LOG_INF("Watchdog initialized");
    return 0;
}

/**
 * BLE connection callbacks
 */
static void connected(struct bt_conn *conn, uint8_t err)
{
    if (err) {
        LOG_ERR("Connection failed: %u", err);
        return;
    }

    LOG_INF("Connected");
    
    /* Stop advertising while connected */
    advertising_stop();
}

static void disconnected(struct bt_conn *conn, uint8_t reason)
{
    LOG_INF("Disconnected: %u", reason);
    
    /* Resume advertising after disconnect */
    if (app_state == STATE_OPERATIONAL) {
        advertising_start(&current_config);
    }
}

BT_CONN_CB_DEFINE(conn_callbacks) = {
    .connected = connected,
    .disconnected = disconnected,
};

/**
 * Main application entry point
 */
int main(void)
{
    int ret;

    LOG_INF("Industrial Sensor Node Starting");
    LOG_INF("Firmware Version: 1.0.0");
    LOG_INF("Device ID: %s", CONFIG_BT_DEVICE_NAME);

    /* Initialize watchdog */
    ret = init_watchdog();
    if (ret < 0) {
        LOG_WRN("Watchdog init failed, continuing without: %d", ret);
    }

    /* Load configuration from non-volatile storage */
    ret = config_manager_load(&current_config);
    if (ret < 0) {
        LOG_WRN("Failed to load config, using defaults: %d", ret);
        config_manager_set_defaults(&current_config);
        app_state = STATE_UNCOMMISSIONED;
    } else {
        LOG_INF("Configuration loaded successfully");
        app_state = STATE_OPERATIONAL;
    }

    /* Initialize power management */
    ret = power_manager_init(&current_config);
    if (ret < 0) {
        LOG_ERR("Power manager init failed: %d", ret);
        return ret;
    }

    /* Initialize sensor hardware */
    ret = sensor_init(&current_config);
    if (ret < 0) {
        LOG_ERR("Sensor init failed: %d", ret);
        return ret;
    }

    /* Initialize BLE */
    ret = bt_enable(NULL);
    if (ret) {
        LOG_ERR("Bluetooth init failed: %d", ret);
        return ret;
    }
    LOG_INF("Bluetooth initialized");

    /* Initialize GATT services */
    ret = gatt_services_init(&current_config);
    if (ret < 0) {
        LOG_ERR("GATT services init failed: %d", ret);
        return ret;
    }

    /* Start BLE advertising */
    ret = advertising_start(&current_config);
    if (ret < 0) {
        LOG_ERR("Advertising start failed: %d", ret);
        return ret;
    }

    /* Initialize diagnostics */
    diagnostics_init();

    /* Initialize and start sampling work */
    k_work_init_delayable(&sample_work, sample_work_handler);
    
    if (app_state == STATE_OPERATIONAL) {
        LOG_INF("Starting sensor sampling (interval: %d seconds)", 
                current_config.sampling.interval_seconds);
        k_work_schedule(&sample_work, K_SECONDS(5)); /* First sample after 5s */
    } else {
        LOG_INF("Node uncommissioned, waiting for configuration");
    }

    /* Main loop - enter low power mode */
    while (1) {
        /* Feed watchdog */
        if (wdt_dev) {
            wdt_feed(wdt_dev, wdt_channel_id);
        }

        /* Sleep for 1 second */
        k_sleep(K_SECONDS(1));

        /* Check for fault state */
        if (app_state == STATE_FAULT) {
            LOG_WRN("Node in fault state");
            /* Update advertising to indicate fault */
            advertising_update_fault_state();
        }
    }

    return 0;
}

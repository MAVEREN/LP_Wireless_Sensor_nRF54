/*
 * Hub Cellular Gateway - Main Application
 * State machine coordinating LTE, Azure IoT Hub, and IPC
 */

#include <zephyr/kernel.h>
#include <zephyr/logging/log.h>
#include <zephyr/drivers/watchdog.h>
#include "network/lte_connection.h"
#include "azure/iot_hub_client.h"
#include "azure/device_twin.h"
#include "azure/provisioning.h"
#include "ipc/ipc_bridge.h"

LOG_MODULE_REGISTER(main, LOG_LEVEL_INF);

/* Hub states */
enum hub_state {
    HUB_INIT,
    LTE_CONNECTING,
    DPS_PROVISIONING,
    IOT_HUB_CONNECTING,
    OPERATIONAL,
    ERROR
};

static enum hub_state current_state = HUB_INIT;
static struct k_work_delayable twin_sync_work;
static const struct device *wdt;

/* Watchdog callback */
static void wdt_callback(const struct device *dev, int channel_id)
{
    LOG_ERR("Watchdog timeout - system reset");
}

/* Initialize watchdog */
static int init_watchdog(void)
{
    wdt = DEVICE_DT_GET(DT_NODELABEL(wdt));
    if (!device_is_ready(wdt)) {
        LOG_ERR("Watchdog device not ready");
        return -ENODEV;
    }

    struct wdt_timeout_cfg wdt_config = {
        .window.min = 0,
        .window.max = 30000, /* 30 seconds */
        .callback = wdt_callback,
    };

    int channel = wdt_install_timeout(wdt, &wdt_config);
    if (channel < 0) {
        LOG_ERR("Failed to install watchdog timeout");
        return channel;
    }

    wdt_setup(wdt, WDT_OPT_PAUSE_HALTED_BY_DBG);
    return 0;
}

/* Feed watchdog */
static void feed_watchdog(void)
{
    if (wdt) {
        wdt_feed(wdt, 0);
    }
}

/* Twin sync worker */
static void twin_sync_worker(struct k_work *work)
{
    if (current_state == OPERATIONAL) {
        device_twin_sync();
        k_work_schedule(&twin_sync_work, K_MINUTES(5));
    }
}

/* State machine */
static void run_state_machine(void)
{
    switch (current_state) {
    case HUB_INIT:
        LOG_INF("Initializing hub");
        if (lte_connection_init() == 0) {
            current_state = LTE_CONNECTING;
        } else {
            current_state = ERROR;
        }
        break;

    case LTE_CONNECTING:
        LOG_INF("Connecting to LTE network");
        if (lte_connection_connect() == 0) {
            if (provisioning_is_provisioned()) {
                current_state = IOT_HUB_CONNECTING;
            } else {
                current_state = DPS_PROVISIONING;
            }
        }
        break;

    case DPS_PROVISIONING:
        LOG_INF("Provisioning via DPS");
        if (provisioning_register() == 0) {
            current_state = IOT_HUB_CONNECTING;
        } else {
            k_sleep(K_SECONDS(30));
        }
        break;

    case IOT_HUB_CONNECTING:
        LOG_INF("Connecting to IoT Hub");
        if (iot_hub_connect() == 0) {
            device_twin_init();
            ipc_bridge_init();
            k_work_schedule(&twin_sync_work, K_MINUTES(5));
            current_state = OPERATIONAL;
        } else {
            k_sleep(K_SECONDS(10));
        }
        break;

    case OPERATIONAL:
        /* Process IPC messages */
        ipc_bridge_process();
        
        /* Process IoT Hub messages */
        iot_hub_process();
        
        /* Feed watchdog */
        feed_watchdog();
        
        k_sleep(K_MSEC(100));
        break;

    case ERROR:
        LOG_ERR("Error state, retrying from init");
        k_sleep(K_SECONDS(60));
        current_state = HUB_INIT;
        break;
    }
}

int main(void)
{
    LOG_INF("Hub Cellular Gateway starting");

    /* Initialize watchdog */
    if (init_watchdog() != 0) {
        LOG_ERR("Failed to initialize watchdog");
    }

    /* Initialize twin sync work */
    k_work_init_delayable(&twin_sync_work, twin_sync_worker);

    /* Run state machine */
    while (1) {
        run_state_machine();
    }

    return 0;
}

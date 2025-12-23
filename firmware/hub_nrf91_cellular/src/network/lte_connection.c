/*
 * LTE Connection Manager Implementation
 */

#include <zephyr/kernel.h>
#include <zephyr/logging/log.h>
#include <modem/lte_lc.h>
#include <modem/modem_info.h>
#include "lte_connection.h"

LOG_MODULE_REGISTER(lte_connection, LOG_LEVEL_INF);

static bool connected = false;

static void lte_handler(const struct lte_lc_evt *const evt)
{
    switch (evt->type) {
    case LTE_LC_EVT_NW_REG_STATUS:
        if (evt->nw_reg_status == LTE_LC_NW_REG_REGISTERED_HOME ||
            evt->nw_reg_status == LTE_LC_NW_REG_REGISTERED_ROAMING) {
            LOG_INF("LTE network registered");
            connected = true;
        } else {
            connected = false;
        }
        break;
    case LTE_LC_EVT_PSM_UPDATE:
        LOG_INF("PSM parameter update: TAU=%d, Active time=%d",
                evt->psm_cfg.tau, evt->psm_cfg.active_time);
        break;
    default:
        break;
    }
}

int lte_connection_init(void)
{
    int err;

    err = lte_lc_init();
    if (err) {
        LOG_ERR("Failed to initialize LTE link controller: %d", err);
        return err;
    }

    err = lte_lc_register_handler(lte_handler);
    if (err) {
        LOG_ERR("Failed to register LTE handler: %d", err);
        return err;
    }

    /* Request PSM */
    err = lte_lc_psm_req(true);
    if (err) {
        LOG_WRN("Failed to request PSM: %d", err);
    }

    return 0;
}

int lte_connection_connect(void)
{
    int err;

    LOG_INF("Connecting to LTE network");

    err = lte_lc_connect_async(lte_handler);
    if (err) {
        LOG_ERR("Failed to start LTE connection: %d", err);
        return err;
    }

    /* Wait for connection (with timeout) */
    for (int i = 0; i < 60; i++) {
        if (connected) {
            LOG_INF("LTE connected successfully");
            return 0;
        }
        k_sleep(K_SECONDS(1));
    }

    LOG_ERR("LTE connection timeout");
    return -ETIMEDOUT;
}

void lte_connection_disconnect(void)
{
    lte_lc_offline();
    connected = false;
}

bool lte_connection_is_connected(void)
{
    return connected;
}

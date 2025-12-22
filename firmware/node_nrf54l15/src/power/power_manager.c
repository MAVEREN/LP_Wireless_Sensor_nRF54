/*
 * Power Manager Implementation - Stub
 */

#include "power_manager.h"
#include <zephyr/logging/log.h>

LOG_MODULE_REGISTER(power_manager, LOG_LEVEL_INF);

int power_manager_init(struct node_config *config)
{
    LOG_INF("Power manager initialized (stub)");
    return 0;
}

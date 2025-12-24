/* Provisioning stub implementation */

#include <zephyr/logging/log.h>
#include "provisioning.h"

LOG_MODULE_REGISTER(provisioning, LOG_LEVEL_INF);

bool provisioning_is_provisioned(void) {
    /* Check NVS for credentials */
    return true; /* Stub - assume provisioned */
}

int provisioning_register(void) {
    LOG_INF("DPS registration");
    return 0;
}

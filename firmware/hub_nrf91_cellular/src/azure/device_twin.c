/* Device Twin stub implementation */

#include <zephyr/logging/log.h>
#include "device_twin.h"

LOG_MODULE_REGISTER(device_twin, LOG_LEVEL_INF);

void device_twin_init(void) {
    LOG_INF("Device Twin initialized");
}

void device_twin_sync(void) {
    LOG_INF("Syncing Device Twin");
}

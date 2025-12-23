/* IPC Bridge stub implementation */

#include <zephyr/logging/log.h>
#include "ipc_bridge.h"

LOG_MODULE_REGISTER(ipc_bridge, LOG_LEVEL_INF);

void ipc_bridge_init(void) {
    LOG_INF("IPC Bridge initialized");
}

void ipc_bridge_process(void) {
    /* Process UART messages from BLE processor */
}

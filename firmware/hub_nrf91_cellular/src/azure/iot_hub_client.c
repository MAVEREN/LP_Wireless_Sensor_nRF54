/* Azure IoT Hub Client stub implementation */

#include <zephyr/logging/log.h>
#include "iot_hub_client.h"

LOG_MODULE_REGISTER(iot_hub, LOG_LEVEL_INF);

int iot_hub_connect(void) {
    LOG_INF("Connecting to Azure IoT Hub");
    return 0; /* Stub - success */
}

void iot_hub_disconnect(void) {
    LOG_INF("Disconnecting from Azure IoT Hub");
}

void iot_hub_process(void) {
    /* Process MQTT messages */
}

int iot_hub_publish_telemetry(const char *data) {
    LOG_INF("Publishing telemetry: %s", data);
    return 0;
}

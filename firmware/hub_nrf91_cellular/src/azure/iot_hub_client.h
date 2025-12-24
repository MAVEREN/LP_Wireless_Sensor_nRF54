/*
 * Azure IoT Hub Client stub
 */

#ifndef IOT_HUB_CLIENT_H
#define IOT_HUB_CLIENT_H

int iot_hub_connect(void);
void iot_hub_disconnect(void);
void iot_hub_process(void);
int iot_hub_publish_telemetry(const char *data);

#endif /* IOT_HUB_CLIENT_H */

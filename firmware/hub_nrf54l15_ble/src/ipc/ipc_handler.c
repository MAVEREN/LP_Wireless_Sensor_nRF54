/**
 * @file ipc_handler.c
 * @brief IPC handler implementation
 */

#include "ipc_handler.h"
#include <zephyr/kernel.h>
#include <zephyr/logging/log.h>
#include <string.h>

LOG_MODULE_REGISTER(ipc_handler, LOG_LEVEL_INF);

int ipc_handler_init(void)
{
	LOG_INF("IPC handler initialized");
	return 0;
}

int ipc_send(enum ipc_message_type type, const uint8_t *payload, uint16_t len)
{
	LOG_INF("IPC send: type=%d, len=%d", type, len);
	/* UART send implementation */
	return 0;
}

int ipc_receive(struct ipc_message *msg)
{
	/* UART receive implementation */
	return 0;
}

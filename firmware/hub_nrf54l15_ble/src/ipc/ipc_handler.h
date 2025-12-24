/**
 * @file ipc_handler.h
 * @brief IPC handler for communication with cellular processor
 */

#ifndef IPC_HANDLER_H
#define IPC_HANDLER_H

#include <stdint.h>

enum ipc_message_type {
	IPC_NODE_DISCOVERED,
	IPC_NODE_TELEMETRY,
	IPC_JOB_REQUEST,
	IPC_JOB_RESULT,
	IPC_TWIN_UPDATE
};

struct ipc_message {
	uint16_t length;
	uint8_t type;
	uint8_t version;
	uint32_t crc32;
	uint8_t payload[256];
};

int ipc_handler_init(void);
int ipc_send(enum ipc_message_type type, const uint8_t *payload, uint16_t len);
int ipc_receive(struct ipc_message *msg);

#endif /* IPC_HANDLER_H */

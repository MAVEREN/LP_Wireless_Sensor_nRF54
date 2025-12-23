/**
 * @file job_executor.h
 * @brief Job execution engine for Hub BLE Central
 */

#ifndef JOB_EXECUTOR_H
#define JOB_EXECUTOR_H

#include <zephyr/bluetooth/bluetooth.h>
#include <stdint.h>

#define MAX_JOBS 16

enum job_type {
	JOB_PUSH_CONFIG,
	JOB_PULL_DIAGNOSTICS,
	JOB_UPDATE_FIRMWARE,
	JOB_REBOOT_NODE
};

enum job_state {
	JOB_STATE_QUEUED,
	JOB_STATE_RUNNING,
	JOB_STATE_COMPLETED,
	JOB_STATE_FAILED
};

struct job {
	bool valid;
	uint32_t job_id;
	enum job_type type;
	enum job_state state;
	bt_addr_le_t target_addr;
	uint8_t *payload;
	uint16_t payload_len;
	uint32_t queued_time;
	uint32_t start_time;
	uint32_t end_time;
	uint8_t retry_count;
	int result_code;
};

int job_executor_init(void);
int job_executor_queue(enum job_type type, const bt_addr_le_t *addr,
                       const uint8_t *payload, uint16_t len);
int job_executor_process(void);
int job_executor_cancel(uint32_t job_id);
struct job *job_executor_get(uint32_t job_id);
int job_executor_get_pending_count(void);

#endif /* JOB_EXECUTOR_H */

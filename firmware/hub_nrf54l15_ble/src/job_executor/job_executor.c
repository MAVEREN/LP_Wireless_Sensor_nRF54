/**
 * @file job_executor.c
 * @brief Job execution implementation
 */

#include "job_executor.h"
#include <zephyr/kernel.h>
#include <zephyr/logging/log.h>
#include <string.h>

LOG_MODULE_REGISTER(job_executor, LOG_LEVEL_INF);

static struct job jobs[MAX_JOBS];
static struct k_mutex job_mutex;
static uint32_t next_job_id = 1;

int job_executor_init(void)
{
	k_mutex_init(&job_mutex);
	memset(jobs, 0, sizeof(jobs));
	LOG_INF("Job executor initialized");
	return 0;
}

int job_executor_queue(enum job_type type, const bt_addr_le_t *addr,
                       const uint8_t *payload, uint16_t len)
{
	k_mutex_lock(&job_mutex, K_FOREVER);
	
	int index = -1;
	for (int i = 0; i < MAX_JOBS; i++) {
		if (!jobs[i].valid) {
			index = i;
			break;
		}
	}
	
	if (index < 0) {
		k_mutex_unlock(&job_mutex);
		return -ENOMEM;
	}
	
	memset(&jobs[index], 0, sizeof(struct job));
	jobs[index].valid = true;
	jobs[index].job_id = next_job_id++;
	jobs[index].type = type;
	jobs[index].state = JOB_STATE_QUEUED;
	bt_addr_le_copy(&jobs[index].target_addr, addr);
	jobs[index].queued_time = k_uptime_get_32();
	
	if (payload && len > 0) {
		jobs[index].payload = k_malloc(len);
		if (jobs[index].payload) {
			memcpy(jobs[index].payload, payload, len);
			jobs[index].payload_len = len;
		}
	}
	
	LOG_INF("Job %d queued (type %d)", jobs[index].job_id, type);
	
	k_mutex_unlock(&job_mutex);
	return jobs[index].job_id;
}

int job_executor_process(void)
{
	k_mutex_lock(&job_mutex, K_FOREVER);
	
	for (int i = 0; i < MAX_JOBS; i++) {
		if (jobs[i].valid && jobs[i].state == JOB_STATE_QUEUED) {
			jobs[i].state = JOB_STATE_RUNNING;
			jobs[i].start_time = k_uptime_get_32();
			
			/* Execute job (simplified) */
			LOG_INF("Processing job %d", jobs[i].job_id);
			
			/* Simulate job completion */
			jobs[i].state = JOB_STATE_COMPLETED;
			jobs[i].end_time = k_uptime_get_32();
			jobs[i].result_code = 0;
			
			k_mutex_unlock(&node_mutex);
			return jobs[i].job_id;
		}
	}
	
	k_mutex_unlock(&job_mutex);
	return 0;
}

int job_executor_get_pending_count(void)
{
	int count = 0;
	k_mutex_lock(&job_mutex, K_FOREVER);
	for (int i = 0; i < MAX_JOBS; i++) {
		if (jobs[i].valid && jobs[i].state == JOB_STATE_QUEUED) count++;
	}
	k_mutex_unlock(&job_mutex);
	return count;
}

int job_executor_cancel(uint32_t job_id) { return 0; }
struct job *job_executor_get(uint32_t job_id) { return NULL; }

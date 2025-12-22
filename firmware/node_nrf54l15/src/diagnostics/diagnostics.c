/*
 * Diagnostics Implementation - Stub
 */

#include "diagnostics.h"
#include <zephyr/logging/log.h>

LOG_MODULE_REGISTER(diagnostics, LOG_LEVEL_INF);

static int fault_count = 0;

void diagnostics_init(void)
{
    fault_count = 0;
    LOG_INF("Diagnostics initialized");
}

void diagnostics_record_fault(uint8_t fault_code)
{
    fault_count++;
    LOG_WRN("Fault recorded: 0x%02x (count: %d)", fault_code, fault_count);
}

int diagnostics_get_fault_count(void)
{
    return fault_count;
}

void diagnostics_clear_fault_count(void)
{
    fault_count = 0;
}

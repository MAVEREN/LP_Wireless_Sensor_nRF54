/*
 * Diagnostics - Stub
 */

#ifndef DIAGNOSTICS_H
#define DIAGNOSTICS_H

#include <zephyr/kernel.h>

#define FAULT_SENSOR_READ_FAILED  0x01
#define FAULT_BATTERY_LOW         0x02
#define FAULT_WATCHDOG_RESET      0x04

void diagnostics_init(void);
void diagnostics_record_fault(uint8_t fault_code);
int diagnostics_get_fault_count(void);
void diagnostics_clear_fault_count(void);

#endif /* DIAGNOSTICS_H */

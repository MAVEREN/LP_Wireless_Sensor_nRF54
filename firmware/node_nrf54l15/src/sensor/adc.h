/*
 * ADC Module - Stub implementation
 */

#ifndef ADC_H
#define ADC_H

#include <zephyr/kernel.h>

int adc_init(void);
int adc_read_voltage_mv(int32_t *value_mv);
int adc_read_battery_mv(int32_t *value_mv);

#endif /* ADC_H */

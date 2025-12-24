/*
 * ADC Implementation - Stub
 */

#include "adc.h"
#include <zephyr/logging/log.h>

LOG_MODULE_REGISTER(adc, LOG_LEVEL_DBG);

int adc_init(void)
{
    LOG_INF("ADC initialized (stub)");
    return 0;
}

int adc_read_voltage_mv(int32_t *value_mv)
{
    /* Stub: return simulated value */
    *value_mv = 2500; /* 2.5V */
    return 0;
}

int adc_read_battery_mv(int32_t *value_mv)
{
    /* Stub: return simulated battery voltage */
    *value_mv = 3200; /* 3.2V */
    return 0;
}

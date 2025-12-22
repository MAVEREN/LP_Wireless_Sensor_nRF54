/*
 * Sensor Control Implementation
 */

#include "sensor_control.h"
#include "adc.h"
#include <zephyr/drivers/gpio.h>
#include <zephyr/logging/log.h>

LOG_MODULE_REGISTER(sensor_control, LOG_LEVEL_DBG);

/* Sensor power control GPIO */
#define SENSOR_POWER_NODE DT_ALIAS(sensor_power)
static const struct gpio_dt_spec sensor_power = GPIO_DT_SPEC_GET(SENSOR_POWER_NODE, gpios);

/**
 * Initialize sensor hardware
 */
int sensor_init(struct node_config *config)
{
    int ret;

    /* Initialize sensor power GPIO */
    if (!device_is_ready(sensor_power.port)) {
        LOG_ERR("Sensor power GPIO not ready");
        return -ENODEV;
    }

    ret = gpio_pin_configure_dt(&sensor_power, GPIO_OUTPUT_INACTIVE);
    if (ret < 0) {
        LOG_ERR("Failed to configure sensor power GPIO: %d", ret);
        return ret;
    }

    /* Initialize ADC */
    ret = adc_init();
    if (ret < 0) {
        LOG_ERR("ADC init failed: %d", ret);
        return ret;
    }

    LOG_INF("Sensor control initialized");
    return 0;
}

/**
 * Apply calibration to raw ADC value
 */
static float apply_calibration(struct node_config *config, int32_t raw_value)
{
    float voltage = (float)raw_value / 1000.0f; /* Convert mV to V */
    float calibrated;

    /* Linear calibration: y = mx + b */
    calibrated = (voltage * config->calibration.slope) + config->calibration.offset;

    /* Optional polynomial correction: y = y + Ax^2 + Bx */
    if (config->calibration.poly_a != 0.0f || config->calibration.poly_b != 0.0f) {
        float poly = (config->calibration.poly_a * voltage * voltage) + 
                     (config->calibration.poly_b * voltage);
        calibrated += poly;
    }

    return calibrated;
}

/**
 * Read sensor with power gating and calibration
 */
int sensor_read(struct node_config *config, struct sensor_reading *reading)
{
    int ret;
    int32_t adc_values[10];
    int32_t sum = 0;
    uint8_t burst_count = config->sampling.burst_count;

    if (burst_count == 0) {
        burst_count = 1;
    }
    if (burst_count > 10) {
        burst_count = 10;
    }

    /* Enable sensor power */
    gpio_pin_set_dt(&sensor_power, 1);
    LOG_DBG("Sensor power enabled");

    /* Wait for sensor warmup */
    k_msleep(config->sampling.warmup_ms);

    /* Acquire burst samples */
    for (int i = 0; i < burst_count; i++) {
        ret = adc_read_voltage_mv(&adc_values[i]);
        if (ret < 0) {
            gpio_pin_set_dt(&sensor_power, 0);
            LOG_ERR("ADC read failed: %d", ret);
            return ret;
        }
        
        if (i < burst_count - 1) {
            k_msleep(10); /* 10ms between samples */
        }
    }

    /* Disable sensor power */
    gpio_pin_set_dt(&sensor_power, 0);
    LOG_DBG("Sensor power disabled");

    /* Aggregate samples */
    if (config->sampling.aggregation == 0) {
        /* Mean */
        for (int i = 0; i < burst_count; i++) {
            sum += adc_values[i];
        }
        reading->raw_value = sum / burst_count;
    } else {
        /* Median (simple bubble sort for small arrays) */
        for (int i = 0; i < burst_count - 1; i++) {
            for (int j = 0; j < burst_count - i - 1; j++) {
                if (adc_values[j] > adc_values[j + 1]) {
                    int32_t temp = adc_values[j];
                    adc_values[j] = adc_values[j + 1];
                    adc_values[j + 1] = temp;
                }
            }
        }
        reading->raw_value = adc_values[burst_count / 2];
    }

    /* Apply calibration */
    reading->value = apply_calibration(config, reading->raw_value);
    
    /* Set unit (hardcoded for now, should come from config) */
    strcpy(reading->unit, "PSI");

    /* Get battery voltage */
    sensor_get_battery_mv(&reading->battery_mv);

    /* Set timestamp */
    reading->timestamp_ms = k_uptime_get_32();

    /* Check for faults */
    reading->faults = 0;
    if (config->alarms.enable_high && reading->value > config->alarms.high_threshold) {
        reading->faults |= (1 << 0); /* Bit 0: high alarm */
        LOG_WRN("Sensor high alarm: %.2f > %.2f", reading->value, config->alarms.high_threshold);
    }
    if (config->alarms.enable_low && reading->value < config->alarms.low_threshold) {
        reading->faults |= (1 << 1); /* Bit 1: low alarm */
        LOG_WRN("Sensor low alarm: %.2f < %.2f", reading->value, config->alarms.low_threshold);
    }

    LOG_DBG("Sensor read: raw=%d, calibrated=%.2f %s, battery=%dmV, faults=0x%02x",
            reading->raw_value, reading->value, reading->unit, 
            reading->battery_mv, reading->faults);

    return 0;
}

/**
 * Get battery voltage
 */
int sensor_get_battery_mv(uint16_t *voltage_mv)
{
    int ret;
    int32_t battery_raw;

    ret = adc_read_battery_mv(&battery_raw);
    if (ret < 0) {
        LOG_ERR("Battery read failed: %d", ret);
        *voltage_mv = 0;
        return ret;
    }

    *voltage_mv = (uint16_t)battery_raw;
    return 0;
}

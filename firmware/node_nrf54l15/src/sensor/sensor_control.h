/*
 * Sensor Control Module
 * Handles sensor power gating, ADC sampling, and calibration
 */

#ifndef SENSOR_CONTROL_H
#define SENSOR_CONTROL_H

#include <zephyr/kernel.h>

/* Sensor reading structure */
struct sensor_reading {
    float value;            /* Calibrated value in engineering units */
    char unit[8];          /* Unit string (e.g., "PSI", "bar", "°C") */
    int32_t raw_value;     /* Raw ADC value */
    uint32_t timestamp_ms; /* Timestamp in milliseconds */
    uint16_t battery_mv;   /* Battery voltage in mV */
    uint8_t faults;        /* Fault flags */
};

/* Node configuration structure */
struct node_config {
    struct {
        uint32_interval_seconds;      /* Sampling interval */
        uint16_t warmup_ms;            /* Sensor warmup time */
        uint8_t burst_count;           /* Number of samples to average */
        uint8_t aggregation;           /* 0=mean, 1=median */
    } sampling;
    
    struct {
        float offset;                  /* Calibration offset */
        float slope;                   /* Calibration slope */
        float poly_a;                  /* Polynomial coefficient A */
        float poly_b;                  /* Polynomial coefficient B */
    } calibration;
    
    struct {
        float high_threshold;          /* High alarm threshold */
        float low_threshold;           /* Low alarm threshold */
        bool enable_high;              /* Enable high alarm */
        bool enable_low;               /* Enable low alarm */
    } alarms;
    
    uint8_t schema_version;
};

/**
 * Initialize sensor hardware
 */
int sensor_init(struct node_config *config);

/**
 * Read sensor with power gating and calibration
 */
int sensor_read(struct node_config *config, struct sensor_reading *reading);

/**
 * Get battery voltage
 */
int sensor_get_battery_mv(uint16_t *voltage_mv);

#endif /* SENSOR_CONTROL_H */

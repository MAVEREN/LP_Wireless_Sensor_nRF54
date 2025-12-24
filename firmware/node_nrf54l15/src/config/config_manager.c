/*
 * Configuration Manager Implementation - Stub
 */

#include "config_manager.h"
#include <zephyr/logging/log.h>
#include <string.h>

LOG_MODULE_REGISTER(config_manager, LOG_LEVEL_INF);

void config_manager_set_defaults(struct node_config *config)
{
    memset(config, 0, sizeof(*config));
    
    config->sampling.interval_seconds = 60;
    config->sampling.warmup_ms = 100;
    config->sampling.burst_count = 10;
    config->sampling.aggregation = 0; /* mean */
    
    config->calibration.offset = 0.0f;
    config->calibration.slope = 20.0f; /* 0-5V to 0-100 PSI */
    config->calibration.poly_a = 0.0f;
    config->calibration.poly_b = 0.0f;
    
    config->alarms.high_threshold = 100.0f;
    config->alarms.low_threshold = 0.0f;
    config->alarms.enable_high = true;
    config->alarms.enable_low = false;
    
    config->schema_version = 1;
    
    LOG_INF("Configuration set to defaults");
}

int config_manager_load(struct node_config *config)
{
    LOG_INF("Loading configuration (stub - using defaults)");
    config_manager_set_defaults(config);
    return 0;
}

int config_manager_save(struct node_config *config)
{
    LOG_INF("Saving configuration (stub)");
    return 0;
}

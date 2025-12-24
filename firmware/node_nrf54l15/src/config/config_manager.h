/*
 * Configuration Manager - Stub
 */

#ifndef CONFIG_MANAGER_H
#define CONFIG_MANAGER_H

#include "../sensor/sensor_control.h"

int config_manager_load(struct node_config *config);
int config_manager_save(struct node_config *config);
void config_manager_set_defaults(struct node_config *config);

#endif /* CONFIG_MANAGER_H */

/*
 * LTE Connection Manager
 */

#ifndef LTE_CONNECTION_H
#define LTE_CONNECTION_H

int lte_connection_init(void);
int lte_connection_connect(void);
void lte_connection_disconnect(void);
bool lte_connection_is_connected(void);

#endif /* LTE_CONNECTION_H */

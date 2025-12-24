# Hub BLE Central Firmware (nRF54L15)

This firmware runs on the nRF54L15 SoC in the Hub Gateway and provides BLE Central functionality to discover, connect to, and manage sensor nodes.

## Architecture

The Hub BLE firmware operates as a **BLE Central** device that:
1. Scans for advertising node devices
2. Connects to nodes to read configuration and status
3. Writes configuration updates from the cloud
4. Collects telemetry from nodes
5. Communicates with the cellular side via IPC

## Build

```bash
west build -b nrf54l15pdk_nrf54l15_cpuapp
west flash
```

## Modules

- **main.c**: Application entry point, state machine
- **ble_central/**: Scanner and connection management
- **node_manager/**: Node list and policy management  
- **job_executor/**: Job queue and execution
- **ipc/**: Communication with cellular side
- **storage/**: Persistent node bindings

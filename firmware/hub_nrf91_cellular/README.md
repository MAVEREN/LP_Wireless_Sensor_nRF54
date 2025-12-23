# Hub Cellular Gateway Firmware (nRF9160/nRF9151)

Complete cellular gateway firmware for connecting sensor network to Azure IoT Hub.

## Architecture

```
Azure IoT Hub (Cloud)
    ↓ MQTT over LTE
nRF9160/nRF9151 Cellular Processor (This firmware)
    ↓ UART + IPC
nRF54L15 BLE Central Processor
    ↓ BLE GATT
Sensor Nodes (nRF54L15)
```

## Features

- **LTE Connectivity**: LTE-M/NB-IoT with Power Saving Mode
- **Azure IoT Hub**: MQTT client with SAS token authentication
- **Device Twin**: Bidirectional synchronization
- **DPS Provisioning**: Zero-touch device provisioning
- **IPC Bridge**: Communication with BLE processor via UART
- **Reliability**: Watchdog, automatic reconnection, retry logic

## Building

```bash
west build -b nrf9160dk_nrf9160_ns
west flash
```

## Message Flow

**BLE → Cloud**:
1. Node sends telemetry to BLE processor
2. BLE processor forwards via IPC
3. Cellular processor publishes to IoT Hub

**Cloud → Node**:
1. Backend writes desired properties
2. IoT Hub sends twin update
3. Cellular forwards via IPC
4. BLE executes job on node

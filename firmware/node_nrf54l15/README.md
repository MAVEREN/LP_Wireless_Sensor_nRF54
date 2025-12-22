# Node Firmware (nRF54L15)

Ultra-low-power BLE sensor node firmware for the Industrial Sensor Network.

## Overview

The node firmware implements:

- **Sensor power gating**: GPIO-controlled power switch for sensor excitation
- **ADC sampling**: Configurable burst sampling with aggregation (mean/median)
- **BLE advertising**: Compact telemetry broadcast
- **GATT services**: Configuration, calibration, diagnostics, and firmware update
- **Power management**: Deep sleep between samples for multi-year battery life
- **Fault detection**: Sensor disconnect, out-of-range, low battery detection
- **Secure configuration**: Authenticated access for sensitive operations

## Hardware Requirements

- **nRF54L15 Development Kit** (nRF54L15-DK)
- **Analog sensor**: 0-5V ratiometric output
- **Load switch**: For sensor power gating (e.g., TPS22916)
- **Voltage divider**: For ADC input protection

## Building

### Prerequisites

- nRF Connect SDK v2.6+
- West build tool
- ARM GCC toolchain

### Build Commands

```bash
# Build for nRF54L15-DK
west build -b nrf54l15dk/nrf54l15/cpuapp

# Clean build
west build -t clean

# Flash to device
west flash

# View logs
west attach
```

## Configuration

Node configuration is stored in non-volatile storage with:

- Schema versioning
- CRC integrity checking
- Atomic update with rollback

### Default Configuration

```c
{
  "schemaVersion": "1.0.0",
  "sampling": {
    "intervalSeconds": 60,
    "warmupMs": 100,
    "burstCount": 10,
    "aggregation": "mean"
  },
  "calibration": {
    "type": "linear",
    "points": [
      {"voltage": 0.0, "value": 0.0},
      {"voltage": 5.0, "value": 100.0}
    ],
    "unit": "PSI"
  },
  "advertisement": {
    "policy": "each_sample",
    "heartbeatSeconds": 300
  },
  "faults": {
    "enabled": true,
    "lowThreshold": 0.1,
    "highThreshold": 4.9,
    "lowBatteryMv": 2400
  },
  "binding": {
    "hubId": "00:00:00:00:00:00",
    "securityPolicy": "open"
  }
}
```

## Power Consumption

Target power profile:

- **Deep sleep**: < 5 µA
- **Sampling**: ~10 mA for 200 ms (sensor + ADC)
- **BLE advertising**: ~10 mA for 10 ms every 60 s
- **BLE connection**: ~5 mA average during config

### Power Gating Sequence

1. Wake from timer
2. Enable sensor power switch (GPIO high)
3. Delay for sensor warm-up (configurable, typically 100 ms)
4. Acquire ADC burst samples
5. Disable sensor power (GPIO low)
6. Process and advertise
7. Return to deep sleep

## BLE Protocol

See [BLE Protocol Specification](../../docs/interfaces/ble-protocol.md)

### Services

- **Standard Device Information Service** (0x180A)
- **Standard Battery Service** (0x180F)
- **Industrial Sensor Service** (0x1000)
  - Reading (Read, Notify)
  - Config (Read, Write)
  - Calibration (Read, Write)
  - Binding (Read, Write)
  - Diagnostics (Read, Notify)
  - Log Export (Read)
  - Command (Write)

### Advertisement Format

Compact 17-byte manufacturer-specific data:

```
[Company ID: 2][Version: 1][Node ID: 6][Battery %: 1][Reading: 4][Faults: 1][Counter: 2]
```

## Operating States

- **Factory**: Manufacturing test mode
- **Uncommissioned**: Discoverable, awaiting commissioning
- **Commissioning**: Config writes allowed
- **Operational**: Normal sampling and telemetry
- **Maintenance**: Advanced diagnostics enabled
- **Fault**: Safe mode with fault broadcast

## Fault Detection

The node monitors and reports:

- Sensor voltage out of range (high/low)
- Sensor disconnected (open circuit detection)
- ADC saturation
- Low battery (configurable threshold)
- Watchdog resets
- Configuration corruption

## Testing

### Unit Tests

```bash
# Run host-based unit tests
west build -t test
```

### Hardware-in-Loop

See [Hardware-in-Loop Test Guide](../../docs/test/hardware-in-loop.md)

## Development

### Code Structure

```
/src/
  main.c                  # Application entry point
  sensor.c/.h             # Sensor power and ADC
  ble.c/.h                # BLE advertising and GATT
  config.c/.h             # Configuration management
  power.c/.h              # Power management
  fault.c/.h              # Fault detection
  diagnostics.c/.h        # Diagnostics and logging
  
/boards/
  nrf54l15dk_nrf54l15_cpuapp.overlay  # Device tree overlay
  
/prj.conf                 # Kconfig configuration
```

### Adding a New Sensor Type

1. Add calibration curve to schema
2. Implement processing in `sensor.c`
3. Update advertisement payload if needed
4. Add unit tests

## Troubleshooting

### Common Issues

**Node not advertising**
- Check battery voltage
- Verify BLE initialization in logs
- Check for fault state

**Incorrect readings**
- Verify calibration parameters
- Check sensor power sequence timing
- Measure actual sensor output voltage

**High power consumption**
- Verify deep sleep entry
- Check for active peripherals
- Monitor duty cycle with power profiler

## References

- [nRF54L15 Product Specification](https://www.nordicsemi.com/Products/nRF54L15)
- [Zephyr RTOS Documentation](https://docs.zephyrproject.org/)
- [BLE GATT Specifications](https://www.bluetooth.com/specifications/specs/gatt-specification-supplement/)

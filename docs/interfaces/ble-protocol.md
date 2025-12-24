# BLE Protocol Specification

Bluetooth Low Energy (BLE) protocol specification for Industrial Sensor Network.

## Overview

The BLE protocol defines communication between:
- **Nodes** (BLE Peripheral): Sensor devices broadcasting telemetry
- **Hubs** (BLE Central): Gateway devices collecting from nodes
- **Web App** (BLE Central): For local commissioning via Web Bluetooth API

## Service Architecture

### Standard Bluetooth SIG Services

All devices implement:

#### Device Information Service (0x180A)

| Characteristic | UUID | Properties | Description |
|---------------|------|------------|-------------|
| Manufacturer Name | 0x2A29 | Read | "Industrial Sensor Network" |
| Model Number | 0x2A24 | Read | "ISN-NODE-V1" or "ISN-HUB-V1" |
| Serial Number | 0x2A25 | Read | Unique device serial |
| Hardware Revision | 0x2A27 | Read | PCB revision |
| Firmware Revision | 0x2A26 | Read | Firmware version (semver) |
| Software Revision | 0x2A28 | Read | Application version |

#### Battery Service (0x180F)

| Characteristic | UUID | Properties | Description |
|---------------|------|------------|-------------|
| Battery Level | 0x2A19 | Read, Notify | Battery percentage (0-100) |

### Custom Industrial Sensor Service (0x1000)

Primary service for node operations.

| Characteristic | UUID | Properties | Description |
|---------------|------|------------|-------------|
| Reading | 0x1001 | Read, Notify | Latest sensor reading |
| Config | 0x1002 | Read, Write | Node configuration |
| Calibration | 0x1003 | Read, Write | Calibration parameters |
| Binding | 0x1004 | Read, Write | Hub binding info |
| Diagnostics | 0x1005 | Read, Notify | Diagnostics data |
| Log Export | 0x1006 | Read | Log data (chunked) |
| Command | 0x1007 | Write | Control commands |

#### Reading Characteristic (0x1001)

**Format**: Binary, little-endian

```
Offset  Size  Field          Type     Description
------  ----  -----          ----     -----------
0       4     timestamp      uint32   Unix timestamp
4       4     value          float32  Sensor value (engineering units)
8       1     unit_len       uint8    Length of unit string
9       N     unit           string   Unit name (e.g., "PSI", "Bar")
9+N     1     quality        uint8    Quality flags
```

**Quality Flags** (bitfield):
- Bit 0: Valid (1 = valid reading)
- Bit 1: Calibrated (1 = calibration applied)
- Bit 2: In range (1 = within expected range)
- Bit 3: Stable (1 = reading is stable)
- Bits 4-7: Reserved

**Example** (hex):
```
01 02 03 04  // timestamp: 0x04030201
00 00 48 42  // value: 50.0 (float)
03           // unit length: 3
50 53 49     // unit: "PSI"
0F           // quality: 0b00001111 (all flags set)
```

#### Config Characteristic (0x1002)

**Format**: JSON (UTF-8)

See [node-config.schema.json](../../common/schemas/node-config.schema.json)

**Access Control**: Write requires authentication (pairing or binding)

#### Command Characteristic (0x1007)

**Format**: Binary, 1 byte command code + optional parameters

| Command Code | Name | Parameters | Description |
|-------------|------|------------|-------------|
| 0x01 | ENTER_COMMISSIONING | - | Enter commissioning mode |
| 0x02 | EXIT_COMMISSIONING | - | Exit commissioning mode |
| 0x03 | ENTER_MAINTENANCE | - | Enter maintenance mode |
| 0x04 | EXIT_MAINTENANCE | - | Exit maintenance mode |
| 0x05 | TRIGGER_SAMPLE | - | Immediate sensor sample |
| 0x06 | CLEAR_FAULTS | - | Clear fault flags |
| 0x07 | FACTORY_RESET | - | Reset to factory defaults |
| 0x08 | REBOOT | - | Reboot device |

### Hub Management Service (0x2000)

For local Web App access to Hub.

| Characteristic | UUID | Properties | Description |
|---------------|------|------------|-------------|
| Status | 0x2001 | Read, Notify | Hub status |
| Nodes | 0x2002 | Read | List of known nodes |
| Scan Control | 0x2003 | Write | Start/stop scanning |
| Commissioning | 0x2004 | Read, Write | Commissioning assist |
| Hub Config | 0x2005 | Read, Write | Hub configuration |

## Advertisement Protocol

### Node Advertisement

**Manufacturer Specific Data** (Company ID: 0x0059 - Nordic Semiconductor)

```
Offset  Size  Field           Type     Description
------  ----  -----           ----     -----------
0       2     company_id      uint16   0x0059 (Nordic)
2       1     version         uint8    Advertisement version (0x01)
3       6     node_id         bytes    MAC address
9       1     battery_pct     uint8    Battery percentage (0-100)
10      4     last_reading    float32  Last sensor reading
14      1     fault_flags     uint8    Fault flags (bitfield)
15      2     counter         uint16   Sample counter
```

**Total**: 17 bytes (fits in advertisement payload)

**Fault Flags** (bitfield):
- Bit 0: Sensor high
- Bit 1: Sensor low
- Bit 2: Sensor disconnected
- Bit 3: ADC saturation
- Bit 4: Low battery
- Bit 5: Watchdog reset
- Bit 6: Config corrupt
- Bit 7: Reserved

### Advertisement Interval

- **Operational**: 1000 ms (configurable: 100 ms - 10000 ms)
- **Commissioning**: 100 ms (fast discovery)
- **Fault**: 500 ms (ensure quick detection)

### Scan Response

Optional scan response data can include:
- Complete local name: "ISN-NODE-XXXXX"
- TX power level

## Connection Parameters

### Preferred Connection Parameters

| Parameter | Value | Notes |
|-----------|-------|-------|
| Connection Interval | 50-100 ms | Balance responsiveness and power |
| Slave Latency | 0-4 | Allow node to skip events when idle |
| Supervision Timeout | 4000 ms | Detect connection loss |

### Data Length Extension

- Enabled (supports up to 251 byte packets)
- Reduces overhead for config/log transfers

### PHY

- Default: 1M PHY
- Optional: 2M PHY for faster transfers (config/firmware update)

## Security

### Pairing

**Not required for read-only operations** (reading telemetry, diagnostics)

**Required for**:
- Writing configuration
- Writing calibration
- Writing binding
- Executing commands

### Pairing Method

- **Just Works**: For commissioning via authenticated web app
- **Passkey Entry**: Optional for additional security
- **Out-of-Band**: For production environments (NFC, QR code)

### Encryption

- All authenticated characteristics encrypted
- LE Secure Connections (LESC) preferred

### Binding

Node-to-Hub binding establishes trust:
1. Hub MAC address stored in node's binding config
2. Node only accepts privileged commands from bound hub
3. Binding can only be changed via authenticated session

## Error Handling

### GATT Error Codes

| Code | Name | Description |
|------|------|-------------|
| 0x80 | Application Error | General application error |
| 0x81 | Invalid State | Operation not allowed in current state |
| 0x82 | Out of Range | Parameter out of valid range |
| 0x83 | Unauthorized | Authentication required |
| 0x84 | Busy | Device busy, retry later |

### Disconnection Reasons

| Reason | Code | Action |
|--------|------|--------|
| Timeout | 0x08 | Normal, reconnect if needed |
| Remote User Terminated | 0x13 | Intentional, no action |
| Connection Failed | 0x3E | Check RSSI, retry |
| Low Resources | 0x07 | Hub too busy, retry later |

## Web Bluetooth API Usage

### Device Discovery

```typescript
const device = await navigator.bluetooth.requestDevice({
  filters: [
    { services: ['00001000-0000-1000-8000-00805f9b34fb'] },  // Industrial Sensor Service
    { namePrefix: 'ISN-' }
  ],
  optionalServices: [
    '0000180a-0000-1000-8000-00805f9b34fb',  // Device Info
    '0000180f-0000-1000-8000-00805f9b34fb'   // Battery
  ]
});
```

### Reading Characteristic

```typescript
const server = await device.gatt.connect();
const service = await server.getPrimaryService('00001000-0000-1000-8000-00805f9b34fb');
const characteristic = await service.getCharacteristic('00001001-0000-1000-8000-00805f9b34fb');
const value = await characteristic.readValue();

// Parse reading
const timestamp = value.getUint32(0, true);
const reading = value.getFloat32(4, true);
const unitLen = value.getUint8(8);
const unit = new TextDecoder().decode(value.buffer.slice(9, 9 + unitLen));
const quality = value.getUint8(9 + unitLen);
```

### Writing Configuration

```typescript
const config = {
  schemaVersion: "1.0.0",
  sampling: {
    intervalSeconds: 60,
    warmupMs: 100,
    burstCount: 10,
    aggregation: "mean"
  },
  // ... rest of config
};

const json = JSON.stringify(config);
const encoder = new TextEncoder();
const data = encoder.encode(json);

await characteristic.writeValue(data);
```

### Notifications

```typescript
characteristic.addEventListener('characteristicvaluechanged', (event) => {
  const value = event.target.value;
  // Parse and handle reading update
});

await characteristic.startNotifications();
```

## Testing

### BLE Sniffer

Recommended tools:
- nRF Sniffer for Bluetooth LE
- Wireshark with BTLE plugin

### Test Procedure

1. **Advertisement Test**:
   - Verify advertisement format
   - Check advertisement interval
   - Validate manufacturer data

2. **GATT Test**:
   - Read all characteristics
   - Write configuration
   - Verify notifications
   - Test error conditions

3. **Security Test**:
   - Attempt unauthorized write (should fail)
   - Pair and retry (should succeed)
   - Verify encryption

4. **Connection Test**:
   - Multiple simultaneous connections
   - Connection parameter negotiation
   - Graceful disconnection

## References

- [Bluetooth Core Specification v5.4](https://www.bluetooth.com/specifications/bluetooth-core-specification/)
- [GATT Specification Supplement](https://www.bluetooth.com/specifications/specs/gatt-specification-supplement/)
- [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
- [nRF Connect SDK BLE Guide](https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/ug_ble_controller.html)

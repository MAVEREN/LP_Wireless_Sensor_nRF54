# Device Twin Contract Specification

Azure IoT Hub Device Twin contract for Hub devices in the Industrial Sensor Network.

## Overview

The Device Twin is a JSON document stored in Azure IoT Hub for each Hub device. It consists of:
- **Desired properties**: Set by backend/cloud (cloud → device)
- **Reported properties**: Set by device firmware (device → cloud)
- **Tags**: Set by backend for device organization

## Schema Version

All twins MUST include `schemaVersion` at the top level to enable forward/backward compatibility:

```json
{
  "schemaVersion": "1.0.0"
}
```

Version format: MAJOR.MINOR.PATCH (semantic versioning)

## Desired Properties

Configuration and commands sent from cloud to device.

### Full Example

```json
{
  "desired": {
    "schemaVersion": "1.0.0",
    "topology": {
      "siteId": "550e8400-e29b-41d4-a716-446655440000",
      "nodeMappings": [
        {
          "nodeId": "AA:BB:CC:DD:EE:FF",
          "machineId": "550e8400-e29b-41d4-a716-446655440001"
        }
      ]
    },
    "policies": {
      "scanIntervalSeconds": 60,
      "connectMode": "scan_only",
      "telemetryRateLimitPerHour": 1000
    },
    "jobs": [
      {
        "jobId": "job-12345",
        "type": "push_node_config",
        "targetNodeId": "AA:BB:CC:DD:EE:FF",
        "payload": {
          "configuration": {
            "sampling": {
              "intervalSeconds": 60,
              "warmupMs": 100,
              "burstCount": 10,
              "aggregation": "mean"
            }
          }
        },
        "createdAt": "2025-01-15T10:00:00Z",
        "timeoutSeconds": 300
      }
    ],
    "firmwareUpdate": {
      "version": "1.1.0",
      "url": "https://storage.blob.core.windows.net/firmware/hub-1.1.0.bin",
      "checksum": "sha256:abc123...",
      "scheduledAt": "2025-01-16T02:00:00Z"
    }
  }
}
```

### Topology Object

Maps nodes to machines in the logical topology.

```json
"topology": {
  "siteId": "string (UUID)",
  "nodeMappings": [
    {
      "nodeId": "string (MAC address)",
      "machineId": "string (UUID)"
    }
  ]
}
```

### Policies Object

Operational policies for hub behavior.

```json
"policies": {
  "scanIntervalSeconds": 60,          // How often to scan for nodes
  "connectMode": "scan_only",         // scan_only | connect_on_demand | always_connected
  "telemetryRateLimitPerHour": 1000   // Max telemetry messages per hour
}
```

### Jobs Array

Queue of jobs for hub to execute.

```json
"jobs": [
  {
    "jobId": "string (UUID)",
    "type": "push_node_config | pull_node_diagnostics | trigger_node_maintenance | update_hub_firmware | export_support_package",
    "targetNodeId": "string (MAC address, optional)",
    "payload": { /* job-specific data */ },
    "createdAt": "ISO 8601 timestamp",
    "timeoutSeconds": 300
  }
]
```

Job types:
- **push_node_config**: Apply configuration to node
- **pull_node_diagnostics**: Request diagnostics/logs from node
- **trigger_node_maintenance**: Put node into maintenance mode
- **update_hub_firmware**: Update hub's own firmware
- **export_support_package**: Generate and upload support bundle

### Firmware Update Object

Firmware update directive for the hub.

```json
"firmwareUpdate": {
  "version": "string (semver)",
  "url": "string (HTTPS URL)",
  "checksum": "string (sha256:...)",
  "scheduledAt": "ISO 8601 timestamp"
}
```

## Reported Properties

Status and telemetry reported by device to cloud.

### Full Example

```json
{
  "reported": {
    "schemaVersion": "1.0.0",
    "hubStatus": {
      "firmwareVersion": "1.0.5",
      "uptime": 864000,
      "cellularSignal": {
        "rssi": -75,
        "quality": "good"
      },
      "lastSync": "2025-01-15T14:30:00Z",
      "freeMemory": 524288
    },
    "nodes": [
      {
        "nodeId": "AA:BB:CC:DD:EE:FF",
        "lastSeen": "2025-01-15T14:29:00Z",
        "batteryMv": 3200,
        "batteryPercent": 85,
        "lastReading": {
          "value": 45.2,
          "unit": "PSI",
          "timestamp": "2025-01-15T14:29:00Z"
        },
        "faults": ["sensor_high"],
        "firmwareVersion": "1.0.3",
        "rssi": -65
      }
    ],
    "jobResults": [
      {
        "jobId": "job-12345",
        "status": "succeeded",
        "startedAt": "2025-01-15T10:00:15Z",
        "completedAt": "2025-01-15T10:00:45Z",
        "diagnostics": {
          "nodesProcessed": 1,
          "success": true
        }
      }
    ]
  }
}
```

### Hub Status Object

Current status of the hub itself.

```json
"hubStatus": {
  "firmwareVersion": "string (semver)",
  "uptime": 864000,                    // Seconds since boot
  "cellularSignal": {
    "rssi": -75,                       // dBm
    "quality": "excellent | good | fair | poor"
  },
  "lastSync": "ISO 8601 timestamp",
  "freeMemory": 524288                 // Bytes
}
```

### Nodes Array

Summary of all discovered nodes.

```json
"nodes": [
  {
    "nodeId": "string (MAC address)",
    "lastSeen": "ISO 8601 timestamp",
    "batteryMv": 3200,                 // Battery voltage in mV
    "batteryPercent": 85,              // Battery percentage 0-100
    "lastReading": {
      "value": 45.2,
      "unit": "PSI",
      "timestamp": "ISO 8601 timestamp"
    },
    "faults": [                        // Array of fault codes
      "sensor_high",
      "low_battery"
    ],
    "firmwareVersion": "string",
    "rssi": -65                        // Signal strength to hub
  }
]
```

Fault codes:
- `sensor_high`: Sensor reading above threshold
- `sensor_low`: Sensor reading below threshold
- `sensor_disconnected`: Sensor appears disconnected
- `adc_saturation`: ADC saturated
- `low_battery`: Battery below threshold
- `watchdog_reset`: Watchdog reset occurred

### Job Results Array

Results of executed jobs.

```json
"jobResults": [
  {
    "jobId": "string (UUID)",
    "status": "queued | running | succeeded | failed | timeout",
    "startedAt": "ISO 8601 timestamp",
    "completedAt": "ISO 8601 timestamp",
    "errorCode": "string (if failed)",
    "errorMessage": "string (if failed)",
    "diagnostics": { /* job-specific result data */ }
  }
]
```

## Tags

Metadata for organizing devices (not synced to device).

```json
{
  "tags": {
    "organizationId": "550e8400-e29b-41d4-a716-446655440000",
    "siteId": "550e8400-e29b-41d4-a716-446655440001",
    "location": "Building A, Floor 2",
    "installDate": "2025-01-10",
    "updateGroup": "pilot"
  }
}
```

## Update Flow

### Cloud to Device (Desired)

1. Backend updates desired properties via IoT Hub SDK
2. IoT Hub notifies connected device
3. Device processes changes and executes jobs
4. Device updates reported properties with results

### Device to Cloud (Reported)

1. Device updates reported properties via IoT Hub SDK
2. Backend polls or subscribes to twin change events
3. Backend updates local database with device status

## Compatibility Rules

### Adding Fields

- New optional fields can be added to any object
- Devices MUST ignore unknown fields
- Backend MUST NOT require new fields for older schema versions

### Removing Fields

- Mark as deprecated first
- Remove only after all devices upgraded
- Use schema version to handle transition

### Changing Types

- Never change type of existing field
- Create new field with new type if needed
- Deprecate old field

## Error Handling

### Invalid Desired Properties

If device receives invalid desired properties:
1. Log error
2. Report error in `hubStatus.lastError`
3. Do NOT apply invalid config
4. Do NOT crash or reboot

### Job Failure

If job fails:
1. Set job status to "failed"
2. Provide error code and message
3. Include diagnostics if available
4. Continue processing other jobs

## Size Limits

- Entire twin: 8 KB (Azure IoT Hub limit)
- Single property update: 8 KB
- Jobs queue: Max 10 pending jobs recommended
- Nodes array: Max 100 nodes per hub recommended

## Security

- Twin updates require device authentication
- Backend requires IoT Hub service policy
- Secrets never stored in twin
- Use Key Vault for credentials

## Example Updates

### Update Node Configuration

Desired:
```json
{
  "jobs": [{
    "jobId": "job-abc",
    "type": "push_node_config",
    "targetNodeId": "AA:BB:CC:DD:EE:FF",
    "payload": {
      "configuration": {
        "sampling": {
          "intervalSeconds": 120
        }
      }
    }
  }]
}
```

Reported (after completion):
```json
{
  "jobResults": [{
    "jobId": "job-abc",
    "status": "succeeded",
    "completedAt": "2025-01-15T10:05:00Z"
  }]
}
```

### Request Diagnostics

Desired:
```json
{
  "jobs": [{
    "jobId": "job-def",
    "type": "pull_node_diagnostics",
    "targetNodeId": "AA:BB:CC:DD:EE:FF"
  }]
}
```

Reported:
```json
{
  "jobResults": [{
    "jobId": "job-def",
    "status": "succeeded",
    "diagnostics": {
      "uptime": 432000,
      "sampleCount": 7200,
      "faultCount": 2,
      "avgBatteryMv": 3150
    }
  }]
}
```

## References

- [Azure IoT Hub Device Twins](https://docs.microsoft.com/azure/iot-hub/iot-hub-devguide-device-twins)
- [Node Config Schema](../../common/schemas/node-config.schema.json)
- [Device Twin Schema](../../common/schemas/device-twin.schema.json)

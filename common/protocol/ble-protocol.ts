/**
 * BLE Protocol Definitions for Industrial Sensor Network
 * 
 * This file defines UUIDs for GATT services and characteristics
 * used in both Node and Hub BLE interfaces.
 */

/**
 * Base UUID for custom services
 * Format: xxxxxxxx-0000-1000-8000-00805f9b34fb
 */
const BASE_UUID = '00000000-0000-1000-8000-00805f9b34fb';

/**
 * Standard Bluetooth SIG Services
 */
export const STANDARD_SERVICES = {
  DEVICE_INFORMATION: '0000180a-0000-1000-8000-00805f9b34fb',
  BATTERY_SERVICE: '0000180f-0000-1000-8000-00805f9b34fb',
} as const;

/**
 * Standard Bluetooth SIG Characteristics
 */
export const STANDARD_CHARACTERISTICS = {
  MANUFACTURER_NAME: '00002a29-0000-1000-8000-00805f9b34fb',
  MODEL_NUMBER: '00002a24-0000-1000-8000-00805f9b34fb',
  SERIAL_NUMBER: '00002a25-0000-1000-8000-00805f9b34fb',
  HARDWARE_REVISION: '00002a27-0000-1000-8000-00805f9b34fb',
  FIRMWARE_REVISION: '00002a26-0000-1000-8000-00805f9b34fb',
  SOFTWARE_REVISION: '00002a28-0000-1000-8000-00805f9b34fb',
  BATTERY_LEVEL: '00002a19-0000-1000-8000-00805f9b34fb',
} as const;

/**
 * Custom Industrial Sensor Service (Node)
 * Primary service for node sensor operations
 */
export const INDUSTRIAL_SENSOR_SERVICE = '00001000-0000-1000-8000-00805f9b34fb';

export const INDUSTRIAL_SENSOR_CHARACTERISTICS = {
  // Latest sensor reading (Read, Notify)
  READING: '00001001-0000-1000-8000-00805f9b34fb',
  
  // Configuration (Read, Write with auth)
  CONFIG: '00001002-0000-1000-8000-00805f9b34fb',
  
  // Calibration parameters (Read, Write with auth)
  CALIBRATION: '00001003-0000-1000-8000-00805f9b34fb',
  
  // Node binding information (Read, Write with auth)
  BINDING: '00001004-0000-1000-8000-00805f9b34fb',
  
  // Diagnostics data (Read, Notify)
  DIAGNOSTICS: '00001005-0000-1000-8000-00805f9b34fb',
  
  // Log export (Read with chunking)
  LOG_EXPORT: '00001006-0000-1000-8000-00805f9b34fb',
  
  // Command/control (Write)
  COMMAND: '00001007-0000-1000-8000-00805f9b34fb',
} as const;

/**
 * Hub Local Management Service
 * Service exposed by hub for local web app access
 */
export const HUB_MANAGEMENT_SERVICE = '00002000-0000-1000-8000-00805f9b34fb';

export const HUB_MANAGEMENT_CHARACTERISTICS = {
  // Hub status (Read, Notify)
  STATUS: '00002001-0000-1000-8000-00805f9b34fb',
  
  // Known nodes list (Read)
  NODES: '00002002-0000-1000-8000-00805f9b34fb',
  
  // Trigger scan (Write)
  SCAN_CONTROL: '00002003-0000-1000-8000-00805f9b34fb',
  
  // Commissioning assist (Read, Write)
  COMMISSIONING: '00002004-0000-1000-8000-00805f9b34fb',
  
  // Hub configuration (Read, Write with auth)
  HUB_CONFIG: '00002005-0000-1000-8000-00805f9b34fb',
} as const;

/**
 * Firmware Update Service
 * Standard Nordic DFU or similar
 */
export const FIRMWARE_UPDATE_SERVICE = '00003000-0000-1000-8000-00805f9b34fb';

export const FIRMWARE_UPDATE_CHARACTERISTICS = {
  // Control point
  CONTROL_POINT: '00003001-0000-1000-8000-00805f9b34fb',
  
  // Data transfer
  DATA: '00003002-0000-1000-8000-00805f9b34fb',
  
  // Status/progress
  STATUS: '00003003-0000-1000-8000-00805f9b34fb',
} as const;

/**
 * Advertisement Data Format for Node
 * 
 * Compact format to fit in BLE advertising packet
 * Max payload: ~27 bytes for manufacturer-specific data
 */
export interface NodeAdvertisement {
  // Company ID (2 bytes) - use Nordic's or register custom
  companyId: number;
  
  // Advertisement version (1 byte)
  version: number;
  
  // Node identifier (6 bytes - MAC address)
  nodeId: string;
  
  // Battery estimate (1 byte, percentage 0-100)
  batteryPercent: number;
  
  // Last reading summary (4 bytes - float)
  lastReading: number;
  
  // Fault flags (1 byte - bitfield)
  faultFlags: number;
  
  // Freshness counter (2 bytes - increments on each sample)
  counter: number;
  
  // RSSI (filled by receiver)
  rssi?: number;
}

/**
 * Fault flag bit definitions
 */
export const FAULT_FLAGS = {
  SENSOR_HIGH: 0x01,
  SENSOR_LOW: 0x02,
  SENSOR_DISCONNECTED: 0x04,
  ADC_SATURATION: 0x08,
  LOW_BATTERY: 0x10,
  WATCHDOG_RESET: 0x20,
  CONFIG_CORRUPT: 0x40,
  RESERVED: 0x80,
} as const;

/**
 * Command codes for Node control
 */
export const NODE_COMMANDS = {
  ENTER_COMMISSIONING: 0x01,
  EXIT_COMMISSIONING: 0x02,
  ENTER_MAINTENANCE: 0x03,
  EXIT_MAINTENANCE: 0x04,
  TRIGGER_SAMPLE: 0x05,
  CLEAR_FAULTS: 0x06,
  FACTORY_RESET: 0x07,
  REBOOT: 0x08,
} as const;

/**
 * Hub scan control commands
 */
export const HUB_SCAN_COMMANDS = {
  START_SCAN: 0x01,
  STOP_SCAN: 0x02,
  REFRESH_NODES: 0x03,
} as const;

/**
 * Node operating states
 */
export enum NodeState {
  FACTORY = 'factory',
  UNCOMMISSIONED = 'uncommissioned',
  COMMISSIONING = 'commissioning',
  OPERATIONAL = 'operational',
  MAINTENANCE = 'maintenance',
  FAULT = 'fault',
}

/**
 * Reading characteristic payload format
 */
export interface ReadingPayload {
  // Timestamp (Unix epoch, 4 bytes)
  timestamp: number;
  
  // Sensor value in engineering units (4 bytes float)
  value: number;
  
  // Unit string length + string (variable, max 16 chars)
  unit: string;
  
  // Quality flags (1 byte)
  quality: number;
}

/**
 * Quality flag bits
 */
export const QUALITY_FLAGS = {
  VALID: 0x01,
  CALIBRATED: 0x02,
  IN_RANGE: 0x04,
  STABLE: 0x08,
} as const;

/**
 * Diagnostics payload format
 */
export interface DiagnosticsPayload {
  // Uptime in seconds
  uptime: number;
  
  // Sample count
  sampleCount: number;
  
  // Fault count
  faultCount: number;
  
  // Last fault code
  lastFaultCode: number;
  
  // Average battery voltage (mV)
  avgBatteryMv: number;
  
  // Min/Max readings
  minReading: number;
  maxReading: number;
  
  // Connection count (if hub-connected)
  connectionCount: number;
  
  // Last connection timestamp
  lastConnection: number;
}

/**
 * Helper function to create UUID from short form
 */
export function createUUID(shortForm: string): string {
  return `0000${shortForm}-0000-1000-8000-00805f9b34fb`;
}

/**
 * Helper to parse advertisement data
 */
export function parseNodeAdvertisement(data: Uint8Array): NodeAdvertisement | null {
  if (data.length < 17) return null;
  
  const view = new DataView(data.buffer);
  
  try {
    return {
      companyId: view.getUint16(0, true),
      version: view.getUint8(2),
      nodeId: Array.from(data.slice(3, 9))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(':'),
      batteryPercent: view.getUint8(9),
      lastReading: view.getFloat32(10, true),
      faultFlags: view.getUint8(14),
      counter: view.getUint16(15, true),
    };
  } catch {
    return null;
  }
}

/**
 * Helper to encode advertisement data
 */
export function encodeNodeAdvertisement(adv: NodeAdvertisement): Uint8Array {
  const buffer = new ArrayBuffer(17);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  
  view.setUint16(0, adv.companyId, true);
  view.setUint8(2, adv.version);
  
  const macBytes = adv.nodeId.split(':').map(s => parseInt(s, 16));
  bytes.set(macBytes, 3);
  
  view.setUint8(9, adv.batteryPercent);
  view.setFloat32(10, adv.lastReading, true);
  view.setUint8(14, adv.faultFlags);
  view.setUint16(15, adv.counter, true);
  
  return bytes;
}

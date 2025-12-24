/**
 * IPC Message Protocol for Hub (nRF54L15 BLE ↔ nRF91 Cellular)
 * 
 * Messages use length-delimited JSON with CRC32 for integrity.
 * Wire format: [LENGTH:4][PAYLOAD:N][CRC32:4]
 */

/**
 * Base message structure
 */
export interface IPCMessage {
  // Message version for compatibility
  version: string;
  
  // Message type
  type: string;
  
  // Correlation ID for request/response tracking
  correlationId: string;
  
  // Timestamp (Unix epoch)
  timestamp: number;
  
  // Message-specific payload
  payload: unknown;
}

/**
 * Message Types
 */
export enum IPCMessageType {
  // BLE → Cellular: Node discovered
  NODE_DISCOVERED = 'node_discovered',
  
  // BLE → Cellular: Node telemetry summary
  NODE_TELEMETRY = 'node_telemetry',
  
  // Cellular → BLE: Apply config to node
  APPLY_NODE_CONFIG = 'apply_node_config',
  
  // BLE → Cellular: Config applied result
  NODE_CONFIG_RESULT = 'node_config_result',
  
  // Cellular → BLE: Pull logs from node
  PULL_NODE_LOGS = 'pull_node_logs',
  
  // BLE → Cellular: Log chunk
  NODE_LOG_CHUNK = 'node_log_chunk',
  
  // Cellular → BLE: Twin desired update received
  TWIN_DESIRED_UPDATE = 'twin_desired_update',
  
  // BLE → Cellular: Twin reported update to publish
  TWIN_REPORTED_UPDATE = 'twin_reported_update',
  
  // BLE → Cellular: Publish telemetry envelope
  PUBLISH_TELEMETRY = 'publish_telemetry',
  
  // Cellular → BLE: Connection status changed
  CONNECTION_STATUS = 'connection_status',
  
  // Either direction: Heartbeat/keepalive
  HEARTBEAT = 'heartbeat',
  
  // Either direction: Error notification
  ERROR = 'error',
}

/**
 * Node discovered payload
 */
export interface NodeDiscoveredPayload {
  nodeId: string;
  rssi: number;
  advertisementData: {
    batteryPercent: number;
    lastReading: number;
    faultFlags: number;
    counter: number;
  };
}

/**
 * Node telemetry payload
 */
export interface NodeTelemetryPayload {
  nodeId: string;
  machineId?: string;
  reading: {
    timestamp: number;
    value: number;
    unit: string;
    quality: number;
  };
  battery: {
    millivolts: number;
    percent: number;
  };
  faults: string[];
  rssi: number;
}

/**
 * Apply node config payload (Cellular → BLE)
 */
export interface ApplyNodeConfigPayload {
  jobId: string;
  nodeId: string;
  config: {
    sampling?: {
      intervalSeconds: number;
      warmupMs: number;
      burstCount: number;
      aggregation: string;
    };
    calibration?: unknown;
    advertisement?: unknown;
    faults?: unknown;
  };
  timeoutSeconds: number;
}

/**
 * Node config result payload (BLE → Cellular)
 */
export interface NodeConfigResultPayload {
  jobId: string;
  nodeId: string;
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
  appliedAt?: number;
}

/**
 * Pull node logs payload (Cellular → BLE)
 */
export interface PullNodeLogsPayload {
  jobId: string;
  nodeId: string;
  maxBytes: number;
}

/**
 * Node log chunk payload (BLE → Cellular)
 */
export interface NodeLogChunkPayload {
  jobId: string;
  nodeId: string;
  chunkIndex: number;
  totalChunks: number;
  data: string; // Base64 encoded
  complete: boolean;
}

/**
 * Twin desired update payload (Cellular → BLE)
 */
export interface TwinDesiredUpdatePayload {
  version: number;
  desired: unknown; // Full desired properties object
}

/**
 * Twin reported update payload (BLE → Cellular)
 */
export interface TwinReportedUpdatePayload {
  reported: unknown; // Partial reported properties to update
}

/**
 * Publish telemetry envelope payload (BLE → Cellular)
 */
export interface PublishTelemetryPayload {
  telemetry: NodeTelemetryPayload[];
  timestamp: number;
}

/**
 * Connection status payload
 */
export interface ConnectionStatusPayload {
  connected: boolean;
  reason?: string;
  lastSync?: number;
  queuedMessages?: number;
}

/**
 * Error payload
 */
export interface ErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Helper to create IPC message
 */
export function createIPCMessage<T>(
  type: IPCMessageType,
  payload: T,
  correlationId?: string
): IPCMessage {
  return {
    version: '1.0.0',
    type,
    correlationId: correlationId || generateCorrelationId(),
    timestamp: Date.now(),
    payload,
  };
}

/**
 * Generate correlation ID
 */
function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Encode message to wire format
 */
export function encodeIPCMessage(message: IPCMessage): Uint8Array {
  const json = JSON.stringify(message);
  const payload = new TextEncoder().encode(json);
  const crc = calculateCRC32(payload);
  
  const buffer = new ArrayBuffer(4 + payload.length + 4);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);
  
  // Length (4 bytes, little-endian)
  view.setUint32(0, payload.length, true);
  
  // Payload
  bytes.set(payload, 4);
  
  // CRC32 (4 bytes, little-endian)
  view.setUint32(4 + payload.length, crc, true);
  
  return bytes;
}

/**
 * Decode message from wire format
 */
export function decodeIPCMessage(data: Uint8Array): IPCMessage | null {
  if (data.length < 8) return null;
  
  const view = new DataView(data.buffer);
  const length = view.getUint32(0, true);
  
  if (data.length < 4 + length + 4) return null;
  
  const payload = data.slice(4, 4 + length);
  const expectedCrc = view.getUint32(4 + length, true);
  const actualCrc = calculateCRC32(payload);
  
  if (expectedCrc !== actualCrc) {
    console.error('IPC message CRC mismatch');
    return null;
  }
  
  try {
    const json = new TextDecoder().decode(payload);
    return JSON.parse(json) as IPCMessage;
  } catch {
    return null;
  }
}

/**
 * Simple CRC32 implementation
 */
function calculateCRC32(data: Uint8Array): number {
  let crc = 0xffffffff;
  
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * Message queue for reliable delivery
 */
export class IPCMessageQueue {
  private queue: Array<{ message: IPCMessage; retries: number }> = [];
  private readonly maxRetries = 3;
  private readonly maxQueueSize = 100;
  
  enqueue(message: IPCMessage): boolean {
    if (this.queue.length >= this.maxQueueSize) {
      return false;
    }
    
    this.queue.push({ message, retries: 0 });
    return true;
  }
  
  dequeue(): IPCMessage | null {
    const item = this.queue.shift();
    return item ? item.message : null;
  }
  
  requeue(correlationId: string): boolean {
    const index = this.queue.findIndex(
      item => item.message.correlationId === correlationId
    );
    
    if (index === -1) return false;
    
    const item = this.queue[index];
    item.retries++;
    
    if (item.retries >= this.maxRetries) {
      this.queue.splice(index, 1);
      return false;
    }
    
    return true;
  }
  
  size(): number {
    return this.queue.length;
  }
  
  clear(): void {
    this.queue = [];
  }
}

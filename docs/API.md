# API Documentation

Complete REST API reference for the Industrial Sensor Network backend.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.yourdomain.com/api`

## Authentication

All API endpoints (except public endpoints) require JWT authentication:

```http
Authorization: Bearer <jwt_token>
```

### Get Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

**Response**:
```json
{
  "access_token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "admin"
  }
}
```

## Topology API

### Organizations

#### List Organizations
```http
GET /api/topology/organizations
```

**Response**:
```json
[
  {
    "id": 1,
    "name": "Acme Manufacturing",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### Create Organization
```http
POST /api/topology/organizations
Content-Type: application/json

{
  "name": "Acme Manufacturing"
}
```

#### Get Organization
```http
GET /api/topology/organizations/:id
```

#### Update Organization
```http
PUT /api/topology/organizations/:id
Content-Type: application/json

{
  "name": "Updated Name"
}
```

#### Delete Organization
```http
DELETE /api/topology/organizations/:id
```

### Sites

#### List Sites by Organization
```http
GET /api/topology/organizations/:orgId/sites
```

**Response**:
```json
[
  {
    "id": 1,
    "name": "Plant 1",
    "location": "Building A",
    "organization_id": 1,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### Create Site
```http
POST /api/topology/sites
Content-Type: application/json

{
  "name": "Plant 1",
  "location": "Building A",
  "organization_id": 1
}
```

### Sensor Groups

#### List Sensor Groups by Site
```http
GET /api/topology/sites/:siteId/sensor-groups
```

#### Create Sensor Group
```http
POST /api/topology/sensor-groups
Content-Type: application/json

{
  "name": "Press 101",
  "group_type": "hydraulic_press",
  "site_id": 1
}
```

### Nodes

#### List Nodes by Sensor Group
```http
GET /api/topology/sensor-groups/:sensorGroupId/nodes
```

**Response**:
```json
[
  {
    "id": 1,
    "node_id": "NODE-001",
    "device_address": "DC:A6:32:A3:F2:15",
    "sensor_group_id": 1,
    "battery_level": 95,
    "latest_reading": 23.5,
    "fault_flags": 0,
    "last_seen": "2024-12-23T10:00:00Z",
    "firmware_version": "1.0.0"
  }
]
```

#### Create Node
```http
POST /api/topology/nodes
Content-Type: application/json

{
  "node_id": "NODE-001",
  "device_address": "DC:A6:32:A3:F2:15",
  "machine_id": 1
}
```

#### Update Node
```http
PUT /api/topology/nodes/:id
Content-Type: application/json

{
  "battery_level": 95,
  "latest_reading": 23.5,
  "last_seen": "2024-12-23T10:00:00Z"
}
```

### Hubs

#### List Hubs by Site
```http
GET /api/topology/sites/:siteId/hubs
```

#### Create Hub
```http
POST /api/topology/hubs
Content-Type: application/json

{
  "hub_id": "HUB-001",
  "device_id": "hub-001-device",
  "site_id": 1
}
```

## IoT Hub API

### Device Twin Operations

#### Get Device Twin
```http
GET /api/iot-hub/devices/:deviceId/twin
```

**Response**:
```json
{
  "deviceId": "hub-001",
  "properties": {
    "desired": {
      "topology_mapping": {...},
      "policies": {...}
    },
    "reported": {
      "hub_status": {...},
      "nodes": [...]
    }
  }
}
```

#### Get Reported Properties
```http
GET /api/iot-hub/devices/:deviceId/twin/reported
```

#### Update Desired Properties
```http
POST /api/iot-hub/devices/:deviceId/twin/desired
Content-Type: application/json

{
  "topology_mapping": {
    "nodes": [
      {"node_id": "NODE-001", "machine_id": 1}
    ]
  }
}
```

#### Submit Job to Twin
```http
POST /api/iot-hub/devices/:deviceId/jobs
Content-Type: application/json

{
  "job_id": "job-001",
  "type": "push_config",
  "target_node": "NODE-001",
  "payload": {...}
}
```

#### Update Topology Mapping
```http
POST /api/iot-hub/devices/:deviceId/topology
Content-Type: application/json

{
  "nodes": [
    {"node_id": "NODE-001", "machine_id": 1}
  ]
}
```

#### Update Policies
```http
POST /api/iot-hub/devices/:deviceId/policies
Content-Type: application/json

{
  "scan_interval": 30,
  "max_connections": 3
}
```

#### Invoke Direct Method
```http
POST /api/iot-hub/devices/:deviceId/method
Content-Type: application/json

{
  "methodName": "reboot",
  "payload": {},
  "timeout": 30
}
```

#### Check Connection Status
```http
GET /api/iot-hub/devices/:deviceId/connected
```

**Response**:
```json
{
  "connected": true,
  "lastActivityTime": "2024-12-23T10:00:00Z"
}
```

#### Query Devices
```http
POST /api/iot-hub/query
Content-Type: application/json

{
  "query": "SELECT * FROM devices WHERE properties.reported.battery < 20"
}
```

## Jobs API

### Job Management

#### Create Job
```http
POST /api/jobs
Content-Type: application/json

{
  "hub_id": 1,
  "job_type": "push_config",
  "target_node_id": "NODE-001",
  "payload": {...}
}
```

**Response**:
```json
{
  "id": 1,
  "job_id": "job-001",
  "hub_id": 1,
  "job_type": "push_config",
  "status": "queued",
  "created_at": "2024-12-23T10:00:00Z"
}
```

#### Get Job
```http
GET /api/jobs/:id
```

#### List Jobs
```http
GET /api/jobs?hub_id=1&status=queued&limit=10
```

#### Update Job Status
```http
PUT /api/jobs/:id/status
Content-Type: application/json

{
  "status": "completed",
  "result": {...}
}
```

#### Cancel Job
```http
PUT /api/jobs/:id/cancel
```

### Specialized Job Operations

#### Push Node Config
```http
POST /api/jobs/push-node-config
Content-Type: application/json

{
  "hub_id": 1,
  "node_id": "NODE-001",
  "config": {
    "sampling_interval": 60,
    "warmup_ms": 100
  }
}
```

#### Pull Node Diagnostics
```http
POST /api/jobs/pull-node-diagnostics
Content-Type: application/json

{
  "hub_id": 1,
  "node_id": "NODE-001"
}
```

#### Update Hub Firmware
```http
POST /api/jobs/update-hub-firmware
Content-Type: application/json

{
  "hub_id": 1,
  "firmware_url": "https://...",
  "version": "1.1.0"
}
```

#### Get Job Statistics
```http
GET /api/jobs/statistics/summary
```

**Response**:
```json
{
  "total": 100,
  "queued": 5,
  "running": 2,
  "completed": 90,
  "failed": 3
}
```

#### Cleanup Old Jobs
```http
POST /api/jobs/cleanup
Content-Type: application/json

{
  "older_than_days": 30
}
```

## Error Responses

All endpoints return standard error responses:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Rate Limiting

- **Rate limit**: 100 requests per minute per API key
- **Headers**: 
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## Pagination

List endpoints support pagination:

```http
GET /api/topology/organizations?page=1&limit=10
```

**Response**:
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## OpenAPI Specification

Interactive API documentation available at:
- Development: `http://localhost:3000/api/docs`
- Production: `https://api.yourdomain.com/api/docs`

# Industrial Low-Power Sensor Node Network

A production-grade industrial IoT system for converting 0-5V ratiometric sensors into battery-powered BLE sensor nodes based on Nordic nRF54L15, with cellular gateway hubs (nRF9160/nRF9151) and cloud management via Azure IoT Hub.

## System Overview

This project delivers:

- **BLE Sensor Nodes (nRF54L15)**: Ultra-low-power battery-operated sensors with duty-cycled power gating and deep sleep
- **Hub Gateway (nRF54L15 + nRF9160/nRF9151)**: Aggregates nodes via BLE and provides remote management through cellular connectivity
- **Web Application**: TypeScript/React app supporting both local commissioning (Web Bluetooth API) and remote fleet management
- **Backend API**: Node.js/TypeScript backend with Azure IoT Hub integration, RBAC, and topology management
- **Azure Cloud Infrastructure**: IoT Hub, DPS, managed services with Infrastructure as Code

## Technology Stack

- **Firmware**: Nordic nRF Connect SDK (Zephyr RTOS)
- **Backend**: TypeScript, Node.js LTS, NestJS
- **Web App**: TypeScript, React, Vite, Material UI
- **Cloud**: Azure IoT Hub, Azure DPS, Azure Container Apps, PostgreSQL
- **Infrastructure**: Terraform
- **CI/CD**: GitHub Actions with federated identity
- **Testing**: Vitest/Jest (unit), Playwright (E2E), Hardware-in-loop

## Repository Structure

```
/firmware/              # Embedded firmware
  /node_nrf54l15/       # BLE sensor node firmware
  /hub_nrf54l15_ble/    # Hub BLE central firmware
  /hub_nrf91_cellular/  # Hub cellular connectivity firmware
  /shared/              # Common drivers and utilities

/backend/               # Backend API services
  /api/                 # NestJS API implementation
  /infra/               # Backend deployment templates

/apps/                  # Applications
  /web/                 # React web application
  /infra/               # Web app deployment templates

/common/                # Shared contracts and tools
  /schemas/             # JSON schemas for config/twin/telemetry
  /protocol/            # BLE UUIDs, packet definitions, IPC messages
  /tools/               # Validators, decoders, generators

/infra/                 # Infrastructure as Code
  /terraform/           # Terraform modules and environments

/ci/                    # CI/CD pipelines
  /github-actions/      # Reusable workflows
  /scripts/             # Build and deployment scripts

/docs/                  # Documentation
  /architecture/        # Architecture Decision Records (ADRs)
  /interfaces/          # Protocol specifications
  /manufacturing/       # Manufacturing and provisioning guides
  /operations/          # Runbooks and operational guides
```

## Quick Start

### Prerequisites

- **For Firmware Development**:
  - nRF Connect SDK v2.6 or later
  - ARM GCC toolchain
  - Nordic development boards (nRF54L15-DK, nRF9160-DK)

- **For Backend/Web Development**:
  - Node.js LTS (v20+)
  - npm or yarn
  - Docker (for local PostgreSQL)

- **For Infrastructure**:
  - Azure CLI
  - Terraform
  - Azure subscription

### Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MAVEREN/LP_Wireless_Sensor_nRF54.git
   cd LP_Wireless_Sensor_nRF54
   ```

2. **Backend setup**:
   ```bash
   cd backend/api
   npm install
   npm run test
   ```

3. **Web app setup**:
   ```bash
   cd apps/web
   npm install
   npm run dev
   ```

4. **Firmware setup**:
   ```bash
   cd firmware/node_nrf54l15
   west build -b nrf54l15dk/nrf54l15/cpuapp
   ```

See [Developer Setup Guide](docs/DEVELOPER_SETUP.md) for detailed instructions.

## Key Features

### Ultra-Low Power
- Sensor power duty-cycling with configurable warm-up delays
- Deep sleep between samples (targeting years of battery life)
- Optimized BLE advertising and connection policies

### Two Control Planes
1. **Local Control**: On-site commissioning and diagnostics via Web Bluetooth API
2. **Remote Control**: Cloud-based fleet management via Azure IoT Hub Device Twins

### Industrial Reliability
- Deterministic behavior with watchdog protection
- Robust fault detection and reporting
- Atomic configuration updates with rollback
- Signed firmware updates

### Flexible Topology
- Organizations → Sites → Machines/Assets → Nodes/Hubs
- Logical asset grouping independent of radio topology
- Reassignment with full audit trail

### Long-Life Maintainability
- 10-15 year device lifespan support
- Mainstream technology choices
- Schema versioning and backward compatibility
- Automated testing and reproducible builds

## Documentation

- [Architecture Overview](docs/architecture/README.md)
- [BLE Protocol Specification](docs/interfaces/ble-protocol.md)
- [Device Twin Contract](docs/interfaces/device-twin.md)
- [Manufacturing Guide](docs/manufacturing/README.md)
- [Operations Runbooks](docs/operations/README.md)
- [API Documentation](backend/api/docs/api.md)

## Testing

```bash
# Run all tests
npm run test:all

# Backend tests
cd backend/api && npm test

# Web tests
cd apps/web && npm test

# E2E tests
cd apps/web && npm run test:e2e

# Firmware unit tests
cd firmware/node_nrf54l15 && west build -t test
```

## Deployment

Deployment is automated via GitHub Actions with environment-specific approvals:

- **Development**: Auto-deploy on merge to `develop`
- **Staging**: Auto-deploy on merge to `staging`
- **Production**: Manual approval required

See [CI/CD Documentation](docs/operations/cicd.md) for details.

## Security

- Authenticated BLE configuration access
- Node-to-Hub binding for privileged operations
- Azure managed identities for cloud services
- Least privilege RBAC
- Secrets in Azure Key Vault only
- Signed firmware releases

See [Security Policy](SECURITY.md) for reporting vulnerabilities.

## Contributing

This is a production system with strict quality gates:

1. All changes via Pull Requests
2. CI must pass (build, test, lint, security scan)
3. Code review required
4. Documentation updates for API/protocol changes

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/MAVEREN/LP_Wireless_Sensor_nRF54/issues)
- **Documentation**: [docs/](docs/)
- **Discussions**: [GitHub Discussions](https://github.com/MAVEREN/LP_Wireless_Sensor_nRF54/discussions)
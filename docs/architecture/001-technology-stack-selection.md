# ADR-001: Technology Stack Selection

## Status
Accepted

## Context

The Industrial Low-Power Sensor Node Network is designed for a 10-15 year operational lifespan. Technology choices must prioritize:

1. **Longevity**: Mainstream technologies with long-term support
2. **Maintainability**: Well-documented, widely-adopted tools
3. **Ecosystem maturity**: Strong community and commercial backing
4. **Security**: Regular updates and vulnerability management
5. **Talent availability**: Easy to hire developers with required skills

## Decision

We have selected the following mainstream technology stack:

### Embedded Firmware
- **Platform**: Nordic nRF Connect SDK (based on Zephyr RTOS)
- **Rationale**: 
  - Nordic is industry leader in BLE and cellular IoT
  - Zephyr RTOS has strong commercial backing (Linux Foundation)
  - Excellent low-power capabilities
  - Well-documented with extensive examples
  - Long-term chip availability commitment from Nordic

### Backend
- **Language**: TypeScript
- **Runtime**: Node.js LTS (v20+)
- **Framework**: NestJS
- **Rationale**:
  - TypeScript provides type safety and maintainability
  - Node.js LTS has guaranteed 30+ months of support per version
  - NestJS provides structure suitable for long-lived systems
  - Large talent pool
  - Strong integration with Azure services

### Frontend
- **Language**: TypeScript
- **Framework**: React 18+
- **Build Tool**: Vite
- **UI Library**: Material UI
- **Rationale**:
  - React is the most widely adopted frontend framework
  - Material UI provides production-ready components
  - Vite offers fast development experience
  - Web Bluetooth API support in Chromium-based browsers

### Cloud Infrastructure
- **Provider**: Microsoft Azure
- **IaC**: Terraform
- **Rationale**:
  - Azure IoT Hub is mature and well-integrated
  - Azure DPS supports zero-touch provisioning
  - Terraform is cloud-agnostic and widely adopted
  - Microsoft's long-term commitment to Azure

### Data Storage
- **Database**: PostgreSQL (Azure Database for PostgreSQL)
- **Rationale**:
  - ACID compliance for critical topology/audit data
  - JSON/JSONB support for flexible schema evolution
  - Azure managed service for operational simplicity
  - Open-source with strong commercial backing

### Testing
- **Backend/Common**: Jest/Vitest
- **Frontend E2E**: Playwright
- **Rationale**:
  - Industry-standard tools
  - Excellent TypeScript support
  - Active development and maintenance

## Consequences

### Positive
- Mainstream choices ensure long-term viability
- Large talent pool for hiring and community support
- Extensive documentation and examples available
- Strong security track record and update cadence
- Cross-platform development capabilities

### Negative
- Node.js backend may have lower raw performance vs. compiled languages
- TypeScript adds build complexity vs. JavaScript
- Azure lock-in (mitigated by Terraform abstraction)
- Web Bluetooth API limited to Chromium browsers

### Neutral
- Learning curve for teams unfamiliar with chosen stack
- Need to stay current with LTS versions and migrations

## Alternatives Considered

1. **Go for Backend**
   - Pros: Better performance, single binary deployment
   - Cons: Smaller talent pool, less Azure SDK maturity
   
2. **Python for Backend**
   - Pros: Large ecosystem, data science integration
   - Cons: Runtime overhead, less type safety (without mypy)

3. **Flutter for Web/Mobile**
   - Pros: Single codebase for web and mobile
   - Cons: Web Bluetooth support uncertain, smaller ecosystem

4. **AWS Instead of Azure**
   - Pros: Larger market share
   - Cons: IoT Hub equivalent less mature, DPS not as integrated

5. **Pulumi Instead of Terraform**
   - Pros: Use TypeScript for infrastructure
   - Cons: Smaller community, less mature

## References
- [Node.js LTS Schedule](https://github.com/nodejs/release#release-schedule)
- [Nordic nRF Connect SDK](https://www.nordicsemi.com/Products/Development-software/nRF-Connect-SDK)
- [React Documentation](https://react.dev/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Azure IoT Hub](https://azure.microsoft.com/en-us/services/iot-hub/)
- [Terraform](https://www.terraform.io/)

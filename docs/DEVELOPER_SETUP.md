# Developer Setup Guide

Complete guide for setting up your development environment for the Industrial Low-Power Sensor Node Network project.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Repository Setup](#repository-setup)
3. [Backend Development](#backend-development)
4. [Web Application Development](#web-application-development)
5. [Firmware Development](#firmware-development)
6. [Infrastructure Development](#infrastructure-development)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools

#### For All Developers

- **Git**: Version 2.30 or later
  ```bash
  git --version
  ```

- **Node.js**: LTS version (v20.x)
  ```bash
  # Using nvm (recommended)
  nvm install 20
  nvm use 20
  node --version  # Should show v20.x.x
  ```

- **npm**: Comes with Node.js (v10.x or later)
  ```bash
  npm --version
  ```

#### For Backend/Web Development

- **Docker Desktop**: For local PostgreSQL
  ```bash
  docker --version
  docker compose version
  ```

- **PostgreSQL Client**: For database management
  ```bash
  # macOS
  brew install postgresql
  
  # Ubuntu
  sudo apt-get install postgresql-client
  ```

#### For Infrastructure Development

- **Terraform**: v1.5 or later
  ```bash
  # macOS
  brew install terraform
  
  # Or download from terraform.io
  terraform version
  ```

- **Azure CLI**: v2.50 or later
  ```bash
  # macOS
  brew install azure-cli
  
  # Or use installer from docs.microsoft.com
  az version
  ```

#### For Firmware Development

- **nRF Connect SDK**: v2.6 or later
  - Follow [Nordic's installation guide](https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/installation.html)

- **ARM GCC Toolchain**: Included with nRF Connect SDK

- **JLink**: For debugging (optional but recommended)

- **Nordic Development Kits**:
  - nRF54L15-DK for node development
  - nRF9160-DK or nRF9151-DK for hub development

### Optional but Recommended

- **Visual Studio Code**: With extensions:
  - ESLint
  - Prettier
  - TypeScript
  - Docker
  - Terraform
  - C/C++ (for firmware)

## Repository Setup

### 1. Clone the Repository

```bash
git clone https://github.com/MAVEREN/LP_Wireless_Sensor_nRF54.git
cd LP_Wireless_Sensor_nRF54
```

### 2. Install Dependencies

The project is a monorepo. Install dependencies for each component:

```bash
# Common schemas and protocols
cd common
npm install
npm run build
cd ..

# Backend API
cd backend/api
npm install
cd ../..

# Web application
cd apps/web
npm install
cd ../..
```

### 3. Environment Configuration

Create environment files:

```bash
# Backend environment
cp backend/api/.env.example backend/api/.env.local

# Web app environment  
cp apps/web/.env.example apps/web/.env.local
```

Edit the `.env.local` files with your local configuration.

## Backend Development

### 1. Start Local PostgreSQL

Using Docker Compose:

```bash
# Create docker-compose.yml for local development
cd backend/api
docker compose up -d
```

Or use the provided development script:

```bash
npm run dev:db
```

### 2. Run Database Migrations

```bash
cd backend/api
npm run typeorm migration:run
```

### 3. Start Development Server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

API Documentation (Swagger): `http://localhost:3000/api/docs`

### 4. Run Tests

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## Web Application Development

### 1. Start Development Server

```bash
cd apps/web
npm run dev
```

The web app will be available at `http://localhost:5173`

### 2. Run Tests

```bash
# Unit tests
npm test

# E2E tests (requires backend running)
npm run test:e2e

# E2E with UI
npm run test:e2e:ui
```

### 3. Build for Production

```bash
npm run build
npm run preview  # Preview production build
```

## Firmware Development

### 1. Set Up nRF Connect SDK

Follow Nordic's official guide to install nRF Connect SDK v2.6+

### 2. Build Node Firmware

```bash
cd firmware/node_nrf54l15
west build -b nrf54l15dk/nrf54l15/cpuapp
```

### 3. Flash to Device

```bash
west flash
```

### 4. View Logs

```bash
west attach
# Or use RTT Viewer
```

### 5. Run Tests

```bash
# Unit tests (host-based)
west build -t test

# Hardware-in-loop tests
# See docs/test/hardware-in-loop.md
```

## Infrastructure Development

### 1. Azure Login

```bash
az login
az account set --subscription "Your-Subscription-Name"
```

### 2. Initialize Terraform

```bash
cd infra/terraform/env/dev
terraform init
```

### 3. Plan Changes

```bash
terraform plan
```

### 4. Apply Changes (Local Dev Only)

```bash
terraform apply
```

**Note**: Production deployments should only go through GitHub Actions CI/CD.

## Testing

### Run All Tests

From the repository root:

```bash
# Backend tests
cd backend/api && npm test && cd ../..

# Web tests
cd apps/web && npm test && cd ../..

# Common package tests
cd common && npm test && cd ..
```

### Integration Testing

1. Start all services:
   ```bash
   # Terminal 1: Database
   cd backend/api && docker compose up
   
   # Terminal 2: Backend
   cd backend/api && npm run start:dev
   
   # Terminal 3: Web app
   cd apps/web && npm run dev
   ```

2. Run E2E tests:
   ```bash
   cd apps/web
   npm run test:e2e
   ```

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port
lsof -i :3000  # Backend
lsof -i :5173  # Web app

# Kill process
kill -9 <PID>
```

#### Database Connection Failed

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
docker compose down
docker compose up -d

# Check logs
docker compose logs postgres
```

#### Module Not Found

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Rebuild common package
cd common && npm run build
```

#### Firmware Build Failed

```bash
# Clean build
west build -t clean
west build -b nrf54l15dk/nrf54l15/cpuapp

# Update SDK
west update
```

### Getting Help

1. Check [Documentation](../docs/)
2. Search [GitHub Issues](https://github.com/MAVEREN/LP_Wireless_Sensor_nRF54/issues)
3. Create a new issue with:
   - Description of the problem
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)
   - Error messages/logs

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write code
- Add tests
- Update documentation

### 3. Test Locally

```bash
# Run linters
npm run lint

# Run tests
npm test

# Build
npm run build
```

### 4. Commit and Push

```bash
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

### 5. Create Pull Request

- Open PR on GitHub
- Wait for CI checks to pass
- Request review
- Address feedback
- Merge when approved

## Code Quality

### Linting

```bash
# Backend
cd backend/api && npm run lint

# Web
cd apps/web && npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### Type Checking

```bash
# Backend
cd backend/api && npx tsc --noEmit

# Web
cd apps/web && npx tsc --noEmit
```

### Code Formatting

```bash
npm run format
```

## Next Steps

- Read [Architecture Documentation](../docs/architecture/)
- Review [API Documentation](../backend/api/docs/)
- Study [BLE Protocol Specification](../docs/interfaces/ble-protocol.md)
- Explore [Example Workflows](../docs/examples/)

---

**Need help?** Open an issue or check our [FAQ](../docs/FAQ.md)

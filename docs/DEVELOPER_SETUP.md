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
  # macOS/Linux
  git --version
  ```
  ```powershell
  # Windows (PowerShell)
  git --version
  ```
  
  **Windows Installation**: Download from [git-scm.com](https://git-scm.com/download/win) or install via:
  ```powershell
  winget install --id Git.Git -e --source winget
  ```

- **Node.js**: LTS version (v20.x)
  ```bash
  # macOS/Linux - Using nvm (recommended)
  nvm install 20
  nvm use 20
  node --version  # Should show v20.x.x
  ```
  ```powershell
  # Windows - Using nvm-windows (recommended)
  nvm install 20
  nvm use 20
  node --version  # Should show v20.x.x
  ```
  
  **Windows Installation**: 
  - Download nvm-windows from [github.com/coreybutler/nvm-windows](https://github.com/coreybutler/nvm-windows/releases)
  - Or download Node.js directly from [nodejs.org](https://nodejs.org/)
  - Or install via winget: `winget install OpenJS.NodeJS.LTS`

- **npm**: Comes with Node.js (v10.x or later)
  ```bash
  # macOS/Linux
  npm --version
  ```
  ```powershell
  # Windows (PowerShell)
  npm --version
  ```

#### For Backend/Web Development

- **Docker Desktop**: For local PostgreSQL
  ```bash
  # macOS/Linux
  docker --version
  docker compose version
  ```
  ```powershell
  # Windows (PowerShell)
  docker --version
  docker compose version
  ```
  
  **Windows Installation**: Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
  - Requires Windows 10/11 64-bit: Pro, Enterprise, or Education (Build 19044 or higher)
  - Requires WSL 2 backend (Windows Subsystem for Linux)

- **PostgreSQL Client**: For database management
  ```bash
  # macOS
  brew install postgresql
  
  # Ubuntu
  sudo apt-get install postgresql-client
  ```
  ```powershell
  # Windows (PowerShell)
  # Option 1: Using Chocolatey
  choco install postgresql --params '/Password:postgres'
  
  # Option 2: Using winget
  winget install PostgreSQL.PostgreSQL
  
  # Option 3: Download installer from postgresql.org
  # https://www.postgresql.org/download/windows/
  ```

#### For Infrastructure Development

- **Terraform**: v1.5 or later
  ```bash
  # macOS
  brew install terraform
  
  # Or download from terraform.io
  terraform version
  ```
  ```powershell
  # Windows (PowerShell)
  # Option 1: Using Chocolatey
  choco install terraform
  
  # Option 2: Using winget
  winget install Hashicorp.Terraform
  
  # Option 3: Download from terraform.io
  # https://www.terraform.io/downloads
  terraform version
  ```

- **Azure CLI**: v2.50 or later
  ```bash
  # macOS
  brew install azure-cli
  
  # Or use installer from docs.microsoft.com
  az version
  ```
  ```powershell
  # Windows (PowerShell)
  # Option 1: Using MSI installer (recommended)
  # Download from https://aka.ms/installazurecliwindows
  
  # Option 2: Using winget
  winget install -e --id Microsoft.AzureCLI
  
  # Verify installation
  az version
  ```

#### For Firmware Development

- **nRF Connect SDK**: v2.6 or later
  - Follow [Nordic's installation guide](https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/installation.html)
  - **Windows**: Use the [nRF Connect for Desktop](https://www.nordicsemi.com/Products/Development-tools/nRF-Connect-for-Desktop) Toolchain Manager
    - Install Toolchain Manager from nRF Connect for Desktop
    - Install nRF Connect SDK v2.6.0 or later
    - Toolchain Manager handles installation of all dependencies (SEGGER, ARM toolchain, etc.)

- **ARM GCC Toolchain**: Included with nRF Connect SDK

- **JLink**: For debugging (optional but recommended)
  - **Windows**: Download from [SEGGER website](https://www.segger.com/downloads/jlink/)

- **Nordic Development Kits**:
  - nRF54L15-DK for node development
  - nRF9160-DK or nRF9151-DK for hub development
  
**Windows Note**: When using nRF Connect SDK on Windows:
- The Toolchain Manager automatically configures environment variables
- Use the `nRF Connect SDK Terminal` or `nRF Connect SDK Command Prompt` provided by the Toolchain Manager
- These terminals have the correct PATH settings for `west`, `cmake`, and ARM GCC

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
# macOS/Linux
git clone https://github.com/MAVEREN/LP_Wireless_Sensor_nRF54.git
cd LP_Wireless_Sensor_nRF54
```

```powershell
# Windows (PowerShell)
git clone https://github.com/MAVEREN/LP_Wireless_Sensor_nRF54.git
cd LP_Wireless_Sensor_nRF54
```

### 2. Install Dependencies

The project is a monorepo. Install dependencies for each component:

```bash
# macOS/Linux
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

```powershell
# Windows (PowerShell)
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
# macOS/Linux
# Backend environment
cp backend/api/.env.example backend/api/.env.local

# Web app environment  
cp apps/web/.env.example apps/web/.env.local
```

```powershell
# Windows (PowerShell)
# Backend environment
Copy-Item backend/api/.env.example backend/api/.env.local

# Web app environment  
Copy-Item apps/web/.env.example apps/web/.env.local
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

**Windows Users**: 
- Install nRF Connect for Desktop from [Nordic's website](https://www.nordicsemi.com/Products/Development-tools/nRF-Connect-for-Desktop)
- Use the Toolchain Manager app to install nRF Connect SDK v2.6.0 or later
- Open "nRF Connect SDK Terminal" or "nRF Connect SDK Command Prompt" from the start menu (installed by Toolchain Manager)
- All subsequent `west` commands should be run in this terminal

### 2. Build Node Firmware

```bash
# macOS/Linux
cd firmware/node_nrf54l15
west build -b nrf54l15dk/nrf54l15/cpuapp
```

```powershell
# Windows (nRF Connect SDK Terminal/PowerShell)
cd firmware/node_nrf54l15
west build -b nrf54l15dk/nrf54l15/cpuapp
```

### 3. Flash to Device

```bash
# macOS/Linux
west flash
```

```powershell
# Windows (nRF Connect SDK Terminal/PowerShell)
west flash
```

### 4. View Logs

```bash
# macOS/Linux
west attach
# Or use RTT Viewer
```

```powershell
# Windows (nRF Connect SDK Terminal/PowerShell)
west attach
# Or use SEGGER RTT Viewer (GUI application)
```

### 5. Run Tests

```bash
# macOS/Linux
# Unit tests (host-based)
west build -t test

# Hardware-in-loop tests
# See docs/test/hardware-in-loop.md
```

```powershell
# Windows (nRF Connect SDK Terminal/PowerShell)
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
   # macOS/Linux
   # Terminal 1: Database
   cd backend/api && docker compose up
   
   # Terminal 2: Backend
   cd backend/api && npm run start:dev
   
   # Terminal 3: Web app
   cd apps/web && npm run dev
   ```
   
   ```powershell
   # Windows (PowerShell)
   # Terminal 1: Database
   cd backend/api; docker compose up
   
   # Terminal 2: Backend
   cd backend/api; npm run start:dev
   
   # Terminal 3: Web app
   cd apps/web; npm run dev
   ```

2. Run E2E tests:
   ```bash
   # macOS/Linux
   cd apps/web
   npm run test:e2e
   ```
   
   ```powershell
   # Windows (PowerShell)
   cd apps/web
   npm run test:e2e
   ```

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# macOS/Linux
# Find process using port
lsof -i :3000  # Backend
lsof -i :5173  # Web app

# Kill process
kill -9 <PID>
```

```powershell
# Windows (PowerShell)
# Find process using port
netstat -ano | findstr :3000  # Backend
netstat -ano | findstr :5173  # Web app

# Kill process (replace <PID> with the process ID from netstat)
taskkill /PID <PID> /F

# Alternative: Use Get-NetTCPConnection
Get-NetTCPConnection -LocalPort 3000 | Select-Object -Property State, OwningProcess
Stop-Process -Id <PID> -Force
```

#### Database Connection Failed

```bash
# macOS/Linux
# Check PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
docker compose down
docker compose up -d

# Check logs
docker compose logs postgres
```

```powershell
# Windows (PowerShell)
# Check PostgreSQL is running
docker ps | Select-String postgres

# Restart PostgreSQL
docker compose down
docker compose up -d

# Check logs
docker compose logs postgres
```

#### Module Not Found

```bash
# macOS/Linux
# Clean install
rm -rf node_modules package-lock.json
npm install

# Rebuild common package
cd common && npm run build
```

```powershell
# Windows (PowerShell)
# Clean install
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install

# Rebuild common package
cd common; npm run build
```

#### Firmware Build Failed

```bash
# macOS/Linux
# Clean build
west build -t clean
west build -b nrf54l15dk/nrf54l15/cpuapp

# Update SDK
west update
```

```powershell
# Windows (nRF Connect SDK Terminal/PowerShell)
# Clean build
west build -t clean
west build -b nrf54l15dk/nrf54l15/cpuapp

# Update SDK
west update
```

### Windows-Specific Issues

#### WSL 2 Required for Docker Desktop

If Docker Desktop fails to start:
1. Ensure Windows 10/11 is updated to build 19044 or higher
2. Enable WSL 2:
   ```powershell
   wsl --install
   wsl --set-default-version 2
   ```
3. Restart your computer
4. Start Docker Desktop

#### Line Ending Issues (Git)

Windows uses CRLF while Linux/macOS use LF. Configure Git to handle this:
```powershell
# Configure Git to checkout as-is, commit as LF
git config --global core.autocrlf input
```

#### Path Length Limitations

Windows has a 260 character path limit. Enable long paths:
```powershell
# Run as Administrator
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

Or enable via Group Policy:
- `gpedit.msc` → Computer Configuration → Administrative Templates → System → Filesystem
- Enable "Enable Win32 long paths"

#### PowerShell Execution Policy

If scripts fail to run:
```powershell
# Check current policy
Get-ExecutionPolicy

# Set policy (run as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### nRF Connect SDK Terminal Not Found

If you can't find the nRF Connect SDK terminal:
1. Open nRF Connect for Desktop
2. Open Toolchain Manager
3. Click the dropdown arrow next to your installed SDK version
4. Click "Open terminal" or "Open bash"
5. Alternatively, manually add to PATH: `C:\ncs\v2.6.0\toolchain\opt\bin`

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
# macOS/Linux
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature-name
```

```powershell
# Windows (PowerShell)
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

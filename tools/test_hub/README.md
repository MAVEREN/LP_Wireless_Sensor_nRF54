# Software Test Hub for Sensor Nodes

A Python-based BLE Central test hub that runs on your computer for testing sensor nodes without physical hub hardware.

## Features

- **BLE Scanning**: Discover advertising sensor nodes
- **Multi-connection**: Connect to multiple nodes simultaneously  
- **GATT Operations**: Read/write all characteristics
- **Interactive CLI**: Real-time commands and telemetry display
- **Mock Cloud**: Simulated Azure IoT Hub for job orchestration
- **Web UI**: Local HTTP server (port 8080) for visualization
- **Cross-platform**: Windows, macOS, Linux support

## Installation

### Prerequisites

- Python 3.8 or later
- Bluetooth LE adapter (built-in or USB)
- pip package manager

### Install Dependencies

```bash
# macOS/Linux
cd tools/test_hub
pip install -r requirements.txt
```

```powershell
# Windows (PowerShell)
cd tools/test_hub
pip install -r requirements.txt
```

### Windows-Specific Setup

1. **Ensure Python is installed**:
   ```powershell
   python --version
   # Or use the py launcher
   py --version
   ```
   
   If not installed, download from [python.org](https://www.python.org/downloads/) or install via:
   ```powershell
   winget install Python.Python.3
   ```

2. **Enable Bluetooth**:
   - Open Settings → Bluetooth & devices
   - Ensure Bluetooth is turned on
   - Verify your Bluetooth adapter supports BLE (Bluetooth 4.0+)

3. **Check Bluetooth adapter**:
   - Open Device Manager (Win + X → Device Manager)
   - Expand "Bluetooth"
   - Ensure your adapter is listed and has no error icons
   - Update driver if needed

4. **Install build tools** (if you encounter compilation errors):
   ```powershell
   # Install Microsoft C++ Build Tools
   # Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
   ```

## Usage

### Basic Commands

```bash
# macOS/Linux
# Basic
python test_hub.py

# Auto-connect to all nodes
python test_hub.py --auto-connect

# With mock cloud
python test_hub.py --mock-cloud
```

```powershell
# Windows (PowerShell)
# Basic
python test_hub.py

# Auto-connect to all nodes
python test_hub.py --auto-connect

# With mock cloud
python test_hub.py --mock-cloud

# Alternative: Use py launcher
py test_hub.py
py test_hub.py --auto-connect
py test_hub.py --mock-cloud
```

## Commands

- `scan` - Start/stop BLE scanning
- `connect <address>` - Connect to node
- `nodes` - List discovered nodes
- `job <type> <node>` - Execute job
- `help` - Show all commands

## Web Interface

Access at `http://localhost:8080` when running with `--mock-cloud`

## Platform Support

- **Windows**: Windows 10+ with Bluetooth LE
  - Requires built-in Bluetooth adapter or USB Bluetooth 4.0+ dongle
  - Some USB adapters may have limited BLE support
  - Built-in adapters generally work best
- **macOS**: 10.15+
- **Linux**: BlueZ 5.43+

## Troubleshooting

### Windows

#### "No Bluetooth adapter found"
- Verify Bluetooth is enabled in Windows Settings
- Check Device Manager for Bluetooth adapter
- Try restarting the Bluetooth service:
  ```powershell
  Restart-Service bthserv
  ```
- Some USB Bluetooth adapters don't support BLE - try a different adapter or use built-in Bluetooth

#### "Access Denied" or "Permission Error"
- Run PowerShell/Command Prompt as Administrator
- Close other applications using Bluetooth (e.g., paired headphones)

#### "Module not found" errors
- Ensure all dependencies are installed:
  ```powershell
  pip install -r requirements.txt --upgrade
  ```
- If using a virtual environment, ensure it's activated:
  ```powershell
  # Create virtual environment
  python -m venv venv
  # Activate it
  .\venv\Scripts\Activate.ps1
  # Install dependencies
  pip install -r requirements.txt
  ```

#### Web interface not accessible
- Check if port 8080 is already in use:
  ```powershell
  netstat -ano | findstr :8080
  ```
- Allow Python through Windows Firewall if prompted
- Access via `http://localhost:8080` or `http://127.0.0.1:8080`

### macOS/Linux

#### Bluetooth permission errors
- On macOS: Grant terminal app Bluetooth permissions in System Preferences → Security & Privacy
- On Linux: Add user to `bluetooth` group: `sudo usermod -a -G bluetooth $USER`

#### "bleak" module errors
- Ensure you have the latest bleak version:
  ```bash
  pip install bleak --upgrade
  ```

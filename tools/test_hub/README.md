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

```bash
cd tools/test_hub
pip install -r requirements.txt
```

## Usage

```bash
# Basic
python test_hub.py

# Auto-connect to all nodes
python test_hub.py --auto-connect

# With mock cloud
python test_hub.py --mock-cloud
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

- Windows 10+ with Bluetooth LE
- macOS 10.15+
- Linux with BlueZ 5.43+

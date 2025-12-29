# Manufacturing and Provisioning Guide

Guide for manufacturing, provisioning, and field deployment of Industrial Sensor Network devices.

## Table of Contents

1. [Manufacturing Process](#manufacturing-process)
2. [Device Provisioning](#device-provisioning)
3. [Quality Assurance](#quality-assurance)
4. [Field Deployment](#field-deployment)
5. [End-of-Line Testing](#end-of-line-testing)

## Manufacturing Process

### Node Manufacturing

#### 1. PCB Assembly

- Populate PCB with components per BOM
- Solder nRF54L15 module
- Install sensor power switch (TPS22916 or equivalent)
- Add voltage divider for ADC input protection
- Install battery connector

#### 2. Programming

```bash
# macOS/Linux
# Flash factory firmware
nrfjprog --program node_factory_v1.0.0.hex --chiperase --verify

# Flash bootloader
nrfjprog --program mcuboot_v1.0.0.hex --sectorerase --verify

# Flash application
nrfjprog --program node_app_v1.0.0.hex --sectorerase --verify --reset
```

```powershell
# Windows (PowerShell or Command Prompt)
# Flash factory firmware
nrfjprog --program node_factory_v1.0.0.hex --chiperase --verify

# Flash bootloader
nrfjprog --program mcuboot_v1.0.0.hex --sectorerase --verify

# Flash application
nrfjprog --program node_app_v1.0.0.hex --sectorerase --verify --reset
```

**Windows Note**: 
- `nrfjprog` requires SEGGER J-Link drivers installed
- Download from [SEGGER website](https://www.segger.com/downloads/jlink/)
- Add `nrfjprog` to PATH or use full path: `C:\Program Files\Nordic Semiconductor\nrf-command-line-tools\bin\nrfjprog.exe`

#### 3. Factory Test

Run automated factory test sequence:

```bash
# macOS/Linux
python scripts/factory-test.py --serial /dev/ttyACM0 --test-plan node-v1
```

```powershell
# Windows (PowerShell)
python scripts/factory-test.py --serial COM3 --test-plan node-v1
```

**Windows Note**: Replace `COM3` with your actual COM port. Find it in Device Manager under "Ports (COM & LPT)".

Test sequence:
- Power-on self-test
- ADC calibration verification
- BLE radio test
- Battery voltage check
- Sensor power switch test
- Deep sleep current measurement
- Write device serial number to UICR

### Hub Manufacturing

Similar process for Hub devices (nRF54L15 + nRF9160/9151).

## Device Provisioning

### Azure DPS Provisioning

#### Prerequisites

- Azure DPS instance deployed
- X.509 certificate hierarchy or SAS keys configured
- Device enrollment group created

#### Provisioning Flow

1. **Enrollment**:
   ```bash
   # macOS/Linux
   # Create individual enrollment in DPS
   az iot dps enrollment create \
     --dps-name <dps-name> \
     --enrollment-id <device-id> \
     --attestation-type x509 \
     --certificate-path device_cert.pem
   ```
   
   ```powershell
   # Windows (PowerShell)
   # Create individual enrollment in DPS
   az iot dps enrollment create `
     --dps-name <dps-name> `
     --enrollment-id <device-id> `
     --attestation-type x509 `
     --certificate-path device_cert.pem
   ```

2. **Device Credentials**:
   - Program X.509 certificate to device secure storage
   - Or provision SAS token (less secure)

3. **First Boot**:
   - Device connects to DPS
   - DPS assigns device to IoT Hub
   - Device receives connection string
   - Device connects to assigned IoT Hub
   - Device Twin initialized

#### Bulk Provisioning

For manufacturing runs > 100 devices:

```bash
# macOS/Linux
# Bulk enrollment via CSV
python scripts/bulk-provision.py \
  --dps-name <dps-name> \
  --enrollment-group <group-name> \
  --device-list devices.csv
```

```powershell
# Windows (PowerShell)
# Bulk enrollment via CSV (same Python command)
python scripts/bulk-provision.py `
  --dps-name <dps-name> `
  --enrollment-group <group-name> `
  --device-list devices.csv
```

**Note**: Python commands are the same on Windows. The backtick (`) is PowerShell's line continuation character (equivalent to backslash in bash).

## Quality Assurance

### Acceptance Criteria

**Nodes:**
- Deep sleep current < 10 µA
- BLE advertising verified
- Sensor reading within ±2% of reference
- Battery life projection > 2 years
- All fault detection working

**Hubs:**
- BLE scanning functional
- Cellular connectivity verified
- IoT Hub connection successful
- Device Twin sync working
- All jobs execute correctly

### Test Reports

Each device receives:
- Unique serial number
- Manufacturing date
- Test results (PASS/FAIL)
- Calibration data
- QA inspector signature

Records stored in manufacturing database.

## Field Deployment

### Node Deployment

1. **Unboxing and Inspection**:
   - Verify packaging intact
   - Check for physical damage
   - Verify serial number matches documentation

2. **Battery Installation**:
   - Install battery (shipped separately)
   - Verify LED blink pattern on power-up

3. **Sensor Connection**:
   - Connect 0-5V ratiometric sensor
   - Verify polarity (Vcc, Signal, GND)

4. **Commissioning**:
   - Open Web App on tablet/laptop
   - Select "Commission Node"
   - Scan for nearby nodes
   - Select node by serial number
   - Assign to sensor group
   - Bind to local hub
   - Apply configuration template
   - Verify first reading

5. **Installation**:
   - Mount securely
   - Ensure antenna clearance
   - Label with asset tag
   - Document installation in web app

### Hub Deployment

1. **Physical Installation**:
   - Mount in weatherproof enclosure if outdoor
   - Connect external power (12-24V DC)
   - Install cellular antenna
   - Install BLE antenna

2. **Network Configuration**:
   - Insert SIM card (if cellular)
   - Verify network registration
   - Check signal strength (RSSI)

3. **Provisioning**:
   - Power on hub
   - Hub auto-provisions via DPS
   - Verify connection in Azure IoT Hub
   - Check Device Twin synchronization

4. **Commissioning**:
   - Open Web App
   - Verify hub appears in fleet
   - Assign hub to site
   - Configure scanning policies
   - Trigger discovery of nearby nodes

## End-of-Line Testing

### Automated Test Station

Hardware:
- Test fixture with pogo pins
- Power supply (3.3V, 500mA)
- BLE sniffer
- nRF52840 DK as test controller

Software:
```bash
# macOS/Linux
# Run full EOL test
python scripts/eol-test.py --station-id 1 --device-type node
```

```powershell
# Windows (PowerShell)
# Run full EOL test
python scripts/eol-test.py --station-id 1 --device-type node
```

### Test Sequence

1. **Electrical Test**:
   - Voltage rails
   - Current consumption
   - GPIO functionality

2. **RF Test**:
   - BLE TX power
   - BLE RX sensitivity
   - Frequency accuracy

3. **Sensor Test**:
   - Apply known voltages (0V, 2.5V, 5V)
   - Verify ADC readings
   - Check linearity

4. **Power Test**:
   - Measure deep sleep current
   - Verify wake-up timing
   - Check battery voltage measurement

5. **Flash Programming**:
   - Bootloader
   - Application firmware
   - Device credentials

6. **Final Verification**:
   - Boot and self-test
   - BLE advertisement
   - Write serial number
   - Generate test report

### Test Data

Store in manufacturing database:
```json
{
  "serialNumber": "NODE-12345",
  "manufactureDate": "2025-01-15T10:30:00Z",
  "hardwareRevision": "1.0",
  "firmwareVersion": "1.0.0",
  "tests": {
    "electrical": "PASS",
    "rf": "PASS",
    "sensor": "PASS",
    "power": "PASS",
    "programming": "PASS"
  },
  "measurements": {
    "sleepCurrentUa": 4.2,
    "txPowerDbm": 0.1,
    "adcLinearity": 0.01
  },
  "inspector": "QA-001",
  "station": "EOL-1"
}
```

## Traceability

All devices tracked with:
- Serial number (laser etched + firmware)
- Manufacturing lot
- Component lot numbers
- Test results
- Calibration data
- Deployment location
- Customer/project assignment

## Recalls and Rework

If field issue discovered:

1. Identify affected lot via traceability
2. Query manufacturing database for all devices in lot
3. Generate recall list
4. Contact customers
5. Issue firmware update or RMA

## References

- [nRF Connect SDK Manufacturing Guide](https://developer.nordicsemi.com/nRF_Connect_SDK/doc/latest/nrf/app_dev/device_guides/nrf54l/index.html)
- [Azure DPS Documentation](https://docs.microsoft.com/azure/iot-dps/)
- [PCB Assembly Specifications](./pcb-assembly-spec.md)

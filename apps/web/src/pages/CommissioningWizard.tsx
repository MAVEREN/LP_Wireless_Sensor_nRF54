import { useState } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Card,
  CardContent,
  Alert,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface CommissioningWizardProps {
  mode: 'node' | 'hub';
}

function CommissioningWizard({ mode }: CommissioningWizardProps) {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Device connection state
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  // Configuration state
  const [config, setConfig] = useState({
    organizationId: '',
    siteId: '',
    machineId: '',
    nodeName: '',
    samplingInterval: 60,
    warmupMs: 100,
    burstCount: 10,
    calibrationOffset: 0,
    calibrationSlope: 20,
  });

  const steps = mode === 'node' 
    ? ['Connect Device', 'Device Info', 'Select Location', 'Configure Sampling', 'Complete']
    : ['Connect Hub', 'Hub Info', 'Select Site', 'Configure Policies', 'Complete'];

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const scanForDevice = async () => {
    setLoading(true);
    setError(null);

    if (!('bluetooth' in navigator)) {
      setError('Web Bluetooth is not supported in this browser');
      setLoading(false);
      return;
    }

    try {
      const serviceUuid = mode === 'node' ? '00001000-0000-1000-8000-00805f9b34fb' : '00002000-0000-1000-8000-00805f9b34fb';
      
      const selectedDevice = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [serviceUuid] },
          { namePrefix: mode === 'node' ? 'ISN-' : 'HUB-' }
        ],
        optionalServices: [
          '0000180a-0000-1000-8000-00805f9b34fb', // Device Info
          '0000180f-0000-1000-8000-00805f9b34fb'  // Battery
        ]
      });

      setDevice(selectedDevice);
      
      // Read device info
      const server = await selectedDevice.gatt?.connect();
      if (server) {
        const deviceInfoService = await server.getPrimaryService('0000180a-0000-1000-8000-00805f9b34fb');
        const firmwareChar = await deviceInfoService.getCharacteristic('00002a26-0000-1000-8000-00805f9b34fb');
        const firmwareValue = await firmwareChar.readValue();
        const firmwareVersion = new TextDecoder().decode(firmwareValue);

        setDeviceInfo({
          name: selectedDevice.name,
          id: selectedDevice.id,
          firmwareVersion,
        });

        handleNext();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to device');
      console.error('Bluetooth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async () => {
    setLoading(true);
    setError(null);

    try {
      if (mode === 'node') {
        // Create node in backend
        await axios.post(`${apiUrl}/api/topology/nodes`, {
          nodeId: deviceInfo.id,
          name: config.nodeName,
          machineId: config.machineId,
          configuration: {
            sampling: {
              intervalSeconds: config.samplingInterval,
              warmupMs: config.warmupMs,
              burstCount: config.burstCount,
              aggregation: 0,
            },
            calibration: {
              offset: config.calibrationOffset,
              slope: config.calibrationSlope,
              polyA: 0,
              polyB: 0,
            },
          },
        });

        // TODO: Write configuration to device via BLE
        // This would use GATT characteristic writes

      } else {
        // Create hub in backend
        await axios.post(`${apiUrl}/api/topology/hubs`, {
          deviceId: deviceInfo.id,
          siteId: config.siteId,
          status: 'commissioned',
        });
      }

      handleNext();
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration');
      console.error('Configuration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Connect Device
        return (
          <Box>
            <Typography variant="body1" paragraph>
              Click the button below to scan for nearby {mode === 'node' ? 'sensor nodes' : 'hubs'}.
              Make sure the device is powered on and in range.
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Button
              variant="contained"
              onClick={scanForDevice}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : `Scan for ${mode === 'node' ? 'Node' : 'Hub'}`}
            </Button>
          </Box>
        );

      case 1: // Device Info
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Device Information</Typography>
            {deviceInfo && (
              <>
                <Typography><strong>Name:</strong> {deviceInfo.name}</Typography>
                <Typography><strong>ID:</strong> {deviceInfo.id}</Typography>
                <Typography><strong>Firmware:</strong> {deviceInfo.firmwareVersion}</Typography>
                <Alert severity="success" sx={{ mt: 2 }}>
                  Device connected successfully!
                </Alert>
              </>
            )}
          </Box>
        );

      case 2: // Select Location
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {mode === 'node' ? 'Select Machine' : 'Select Site'}
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Organization</InputLabel>
              <Select
                value={config.organizationId}
                onChange={(e) => setConfig({ ...config, organizationId: e.target.value })}
              >
                <MenuItem value="org-1">Acme Corporation</MenuItem>
                <MenuItem value="org-2">Test Organization</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Site</InputLabel>
              <Select
                value={config.siteId}
                onChange={(e) => setConfig({ ...config, siteId: e.target.value })}
              >
                <MenuItem value="site-1">Factory Floor 1</MenuItem>
                <MenuItem value="site-2">Warehouse A</MenuItem>
              </Select>
            </FormControl>

            {mode === 'node' && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Machine</InputLabel>
                <Select
                  value={config.machineId}
                  onChange={(e) => setConfig({ ...config, machineId: e.target.value })}
                >
                  <MenuItem value="machine-1">Compressor A</MenuItem>
                  <MenuItem value="machine-2">Pump B</MenuItem>
                </Select>
              </FormControl>
            )}

            {mode === 'node' && (
              <TextField
                fullWidth
                label="Node Name"
                value={config.nodeName}
                onChange={(e) => setConfig({ ...config, nodeName: e.target.value })}
                helperText="Friendly name for this sensor node"
              />
            )}
          </Box>
        );

      case 3: // Configure
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              {mode === 'node' ? 'Sampling Configuration' : 'Hub Policies'}
            </Typography>
            
            {mode === 'node' ? (
              <>
                <TextField
                  fullWidth
                  type="number"
                  label="Sampling Interval (seconds)"
                  value={config.samplingInterval}
                  onChange={(e) => setConfig({ ...config, samplingInterval: parseInt(e.target.value) })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Warmup Time (ms)"
                  value={config.warmupMs}
                  onChange={(e) => setConfig({ ...config, warmupMs: parseInt(e.target.value) })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Burst Count"
                  value={config.burstCount}
                  onChange={(e) => setConfig({ ...config, burstCount: parseInt(e.target.value) })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Calibration Offset"
                  value={config.calibrationOffset}
                  onChange={(e) => setConfig({ ...config, calibrationOffset: parseFloat(e.target.value) })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Calibration Slope"
                  value={config.calibrationSlope}
                  onChange={(e) => setConfig({ ...config, calibrationSlope: parseFloat(e.target.value) })}
                  helperText="Slope for linear calibration (e.g., 20 for 0-5V to 0-100 PSI)"
                />
              </>
            ) : (
              <Alert severity="info">
                Hub policies will be configured via the remote management interface after commissioning.
              </Alert>
            )}
          </Box>
        );

      case 4: // Complete
        return (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              {mode === 'node' ? 'Node' : 'Hub'} commissioned successfully!
            </Alert>
            <Typography variant="body1">
              The {mode === 'node' ? 'node' : 'hub'} is now operational and will begin reporting data.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/fleet')}
              fullWidth
              sx={{ mt: 2 }}
            >
              View Fleet Dashboard
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Commission {mode === 'node' ? 'Node' : 'Hub'}
      </Typography>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent()}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            {activeStep < steps.length - 1 && activeStep !== 0 && (
              <Button
                variant="contained"
                onClick={activeStep === 3 ? saveConfiguration : handleNext}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : activeStep === 3 ? 'Commission' : 'Next'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default CommissioningWizard;

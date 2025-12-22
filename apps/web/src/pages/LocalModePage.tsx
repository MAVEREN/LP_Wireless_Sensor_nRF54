import { Box, Typography, Button, Alert } from '@mui/material';
import { useState } from 'react';

function LocalModePage() {
  const [supported, setSupported] = useState(false);
  const [device, setDevice] = useState<BluetoothDevice | null>(null);

  const checkSupport = () => {
    const isSupported = 'bluetooth' in navigator;
    setSupported(isSupported);
    return isSupported;
  };

  const scanForDevices = async () => {
    if (!checkSupport()) {
      alert('Web Bluetooth is not supported in this browser. Please use Chrome, Edge, or Opera with HTTPS.');
      return;
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['00001000-0000-1000-8000-00805f9b34fb'] }, // Industrial Sensor Service
          { namePrefix: 'ISN-' }
        ],
        optionalServices: [
          '0000180a-0000-1000-8000-00805f9b34fb', // Device Info
          '0000180f-0000-1000-8000-00805f9b34fb'  // Battery
        ]
      });
      
      setDevice(device);
      console.log('Device selected:', device.name);
    } catch (error) {
      console.error('Error scanning for devices:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Local Mode - Web Bluetooth
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        This mode uses the Web Bluetooth API to directly communicate with nearby nodes and hubs.
        Ensure you are using a supported browser (Chrome, Edge, Opera) with HTTPS enabled.
      </Alert>

      <Box mb={2}>
        <Button 
          variant="contained" 
          onClick={scanForDevices}
          disabled={!('bluetooth' in navigator)}
        >
          Scan for Devices
        </Button>
      </Box>

      {device && (
        <Alert severity="success">
          Connected to: {device.name}
        </Alert>
      )}

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Available Actions
        </Typography>
        <ul>
          <li>Commission new nodes</li>
          <li>Configure node settings</li>
          <li>View real-time diagnostics</li>
          <li>Bind nodes to hubs</li>
          <li>Update firmware (OTA)</li>
        </ul>
      </Box>

      <Box mt={4}>
        <Typography variant="body2" color="text.secondary">
          Note: Web Bluetooth requires HTTPS and explicit user permission for each connection.
          This is a security feature to protect users from unauthorized device access.
        </Typography>
      </Box>
    </Box>
  );
}

export default LocalModePage;

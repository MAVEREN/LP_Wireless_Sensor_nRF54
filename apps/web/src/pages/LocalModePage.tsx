import { Box, Typography, Button, Alert, Grid, Card, CardContent, CardActions } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SensorsIcon from '@mui/icons-material/Sensors';
import RouterIcon from '@mui/icons-material/Router';

function LocalModePage() {
  const navigate = useNavigate();
  const [supported] = useState('bluetooth' in navigator);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Local Mode - Web Bluetooth
      </Typography>

      {!supported ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Web Bluetooth is not supported in this browser. Please use Chrome, Edge, or Opera with HTTPS.
        </Alert>
      ) : (
        <Alert severity="info" sx={{ mb: 2 }}>
          This mode uses the Web Bluetooth API to directly communicate with nearby nodes and hubs.
          Ensure you are using a supported browser (Chrome, Edge, Opera) with HTTPS enabled.
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SensorsIcon sx={{ mr: 1, fontSize: 40 }} color="primary" />
                <Typography variant="h5">Commission Node</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Set up a new sensor node with guided wizard:
              </Typography>
              <ul>
                <li>Connect via Web Bluetooth</li>
                <li>Read device information</li>
                <li>Assign to machine</li>
                <li>Configure sampling parameters</li>
                <li>Set calibration values</li>
              </ul>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                onClick={() => navigate('/commission/node')}
                disabled={!supported}
                fullWidth
              >
                Commission Node
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <RouterIcon sx={{ mr: 1, fontSize: 40 }} color="primary" />
                <Typography variant="h5">Commission Hub</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Set up a new gateway hub with guided wizard:
              </Typography>
              <ul>
                <li>Connect via Web Bluetooth</li>
                <li>Read hub information</li>
                <li>Assign to site</li>
                <li>Configure policies</li>
                <li>Register with cloud</li>
              </ul>
            </CardContent>
            <CardActions>
              <Button
                variant="contained"
                onClick={() => navigate('/commission/hub')}
                disabled={!supported}
                fullWidth
              >
                Commission Hub
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Available Actions
        </Typography>
        <ul>
          <li>Commission new nodes and hubs</li>
          <li>View real-time diagnostics</li>
          <li>Configure device settings</li>
          <li>Bind nodes to hubs</li>
          <li>Test sensor readings</li>
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

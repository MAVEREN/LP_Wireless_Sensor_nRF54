import { Box, Typography, Card, CardContent, CardActions, Button, Grid } from '@mui/material';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import CloudIcon from '@mui/icons-material/Cloud';

function HomePage() {
  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Welcome to Industrial Sensor Network
      </Typography>
      
      <Typography variant="body1" paragraph>
        Choose your operating mode:
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <BluetoothIcon color="primary" sx={{ mr: 1, fontSize: 40 }} />
                <Typography variant="h5" component="div">
                  Local Mode
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Use Web Bluetooth API to commission and diagnose nodes and hubs locally.
                Requires Chrome, Edge, or Opera browser with HTTPS.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="large" href="/local">Launch Local Mode</Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CloudIcon color="primary" sx={{ mr: 1, fontSize: 40 }} />
                <Typography variant="h5" component="div">
                  Remote Mode
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Manage your entire fleet remotely via Azure IoT Hub.
                Monitor nodes, configure hubs, and orchestrate jobs from anywhere.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="large" href="/remote">Launch Remote Mode</Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Features
        </Typography>
        <ul>
          <li>Ultra-low-power BLE sensor nodes with multi-year battery life</li>
          <li>Cellular gateway hubs for remote connectivity</li>
          <li>Flexible topology management (Organizations → Sites → SensorGroups → Nodes)</li>
          <li>Secure configuration and firmware updates</li>
          <li>Comprehensive diagnostics and fault detection</li>
          <li>Audit trail for all operations</li>
        </ul>
      </Box>
    </Box>
  );
}

export default HomePage;

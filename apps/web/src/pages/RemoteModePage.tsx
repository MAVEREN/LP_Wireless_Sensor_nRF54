import { Box, Typography, Alert } from '@mui/material';

function RemoteModePage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Remote Mode - Cloud Management
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        This mode connects to the backend API and Azure IoT Hub for remote fleet management.
        Please login to continue.
      </Alert>

      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Features
        </Typography>
        <ul>
          <li>View all organizations, sites, and machines</li>
          <li>Monitor node and hub status</li>
          <li>Configure devices remotely via Device Twin</li>
          <li>Orchestrate firmware updates</li>
          <li>View job history and results</li>
          <li>Export diagnostics and logs</li>
          <li>Audit trail for all operations</li>
        </ul>
      </Box>

      <Box mt={4}>
        <Alert severity="warning">
          Authentication integration with Microsoft Entra ID is pending implementation.
        </Alert>
      </Box>
    </Box>
  );
}

export default RemoteModePage;

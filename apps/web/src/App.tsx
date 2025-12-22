import { Routes, Route } from 'react-router-dom';
import { Box, Container, AppBar, Toolbar, Typography, Button } from '@mui/material';
import HomePage from './pages/HomePage';
import LocalModePage from './pages/LocalModePage';
import RemoteModePage from './pages/RemoteModePage';
import TopologyPage from './pages/TopologyPage';
import FleetDashboard from './pages/FleetDashboard';
import CommissioningWizard from './pages/CommissioningWizard';

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Industrial Sensor Network
          </Typography>
          <Button color="inherit" href="/">Home</Button>
          <Button color="inherit" href="/local">Local</Button>
          <Button color="inherit" href="/remote">Remote</Button>
          <Button color="inherit" href="/topology">Topology</Button>
          <Button color="inherit" href="/fleet">Fleet</Button>
        </Toolbar>
      </AppBar>
      
      <Container sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/local" element={<LocalModePage />} />
          <Route path="/remote" element={<RemoteModePage />} />
          <Route path="/topology" element={<TopologyPage />} />
          <Route path="/fleet" element={<FleetDashboard />} />
          <Route path="/commission/node" element={<CommissioningWizard mode="node" />} />
          <Route path="/commission/hub" element={<CommissioningWizard mode="hub" />} />
        </Routes>
      </Container>
      
      <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: '#f5f5f5' }}>
        <Container>
          <Typography variant="body2" color="text.secondary" align="center">
            © 2025 Industrial Sensor Network. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default App;

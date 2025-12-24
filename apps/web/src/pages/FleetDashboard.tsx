import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Battery80 as BatteryIcon,
  SignalCellularAlt as SignalIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface DashboardStats {
  totalNodes: number;
  activeNodes: number;
  faultNodes: number;
  totalHubs: number;
  connectedHubs: number;
}

interface NodeStatus {
  id: string;
  nodeId: string;
  status: string;
  batteryPercent: number;
  lastReading: any;
  machineId: string;
  machineName?: string;
  lastSeen: Date;
  faults: string[];
}

interface HubStatus {
  id: string;
  deviceId: string;
  status: string;
  lastSeen: Date;
  siteName?: string;
  nodeCount: number;
}

function FleetDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalNodes: 0,
    activeNodes: 0,
    faultNodes: 0,
    totalHubs: 0,
    connectedHubs: 0,
  });
  const [nodes, setNodes] = useState<NodeStatus[]>([]);
  const [hubs, setHubs] = useState<HubStatus[]>([]);
  const [loading, setLoading] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // In a real implementation, these would be combined into a single dashboard API
      // For now, we'll simulate the data
      setStats({
        totalNodes: 24,
        activeNodes: 22,
        faultNodes: 2,
        totalHubs: 5,
        connectedHubs: 5,
      });

      // Simulated node data
      setNodes([
        {
          id: '1',
          nodeId: 'AA:BB:CC:DD:EE:01',
          status: 'operational',
          batteryPercent: 85,
          lastReading: { value: 45.2, unit: 'PSI' },
          machineId: 'machine-1',
          machineName: 'Compressor A',
          lastSeen: new Date(),
          faults: [],
        },
        {
          id: '2',
          nodeId: 'AA:BB:CC:DD:EE:02',
          status: 'fault',
          batteryPercent: 42,
          lastReading: { value: 120.5, unit: 'PSI' },
          machineId: 'machine-2',
          machineName: 'Pump B',
          lastSeen: new Date(Date.now() - 3600000),
          faults: ['sensor_high', 'low_battery'],
        },
      ]);

      setHubs([
        {
          id: '1',
          deviceId: 'hub-001',
          status: 'connected',
          lastSeen: new Date(),
          siteName: 'Factory Floor 1',
          nodeCount: 12,
        },
        {
          id: '2',
          deviceId: 'hub-002',
          status: 'connected',
          lastSeen: new Date(),
          siteName: 'Warehouse A',
          nodeCount: 12,
        },
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
      case 'connected':
        return 'success';
      case 'fault':
      case 'disconnected':
        return 'error';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getBatteryIcon = (percent: number) => {
    if (percent > 60) return <BatteryIcon color="success" />;
    if (percent > 30) return <BatteryIcon color="warning" />;
    return <BatteryIcon color="error" />;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Fleet Dashboard
        </Typography>
        <IconButton onClick={loadDashboardData} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Nodes
              </Typography>
              <Typography variant="h4">{stats.totalNodes}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Active Nodes
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.activeNodes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Fault Nodes
              </Typography>
              <Typography variant="h4" color="error.main">
                {stats.faultNodes}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Hubs
              </Typography>
              <Typography variant="h4">{stats.totalHubs}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Connected Hubs
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.connectedHubs}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Nodes Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Node Activity
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Node ID</TableCell>
                  <TableCell>Machine</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Battery</TableCell>
                  <TableCell>Last Reading</TableCell>
                  <TableCell>Faults</TableCell>
                  <TableCell>Last Seen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {nodes.map((node) => (
                  <TableRow key={node.id}>
                    <TableCell>
                      <code>{node.nodeId}</code>
                    </TableCell>
                    <TableCell>{node.machineName || node.machineId}</TableCell>
                    <TableCell>
                      <Chip
                        label={node.status}
                        color={getStatusColor(node.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {getBatteryIcon(node.batteryPercent)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {node.batteryPercent}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {node.lastReading ? (
                        <Typography variant="body2">
                          {node.lastReading.value} {node.lastReading.unit}
                        </Typography>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {node.faults.length > 0 ? (
                        node.faults.map((fault, idx) => (
                          <Chip
                            key={idx}
                            label={fault}
                            color="error"
                            size="small"
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))
                      ) : (
                        <CheckIcon color="success" fontSize="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(node.lastSeen).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Hubs Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Hub Status
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Device ID</TableCell>
                  <TableCell>Site</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Node Count</TableCell>
                  <TableCell>Last Seen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hubs.map((hub) => (
                  <TableRow key={hub.id}>
                    <TableCell>
                      <code>{hub.deviceId}</code>
                    </TableCell>
                    <TableCell>{hub.siteName || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={hub.status}
                        color={getStatusColor(hub.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{hub.nodeCount}</TableCell>
                    <TableCell>
                      {new Date(hub.lastSeen).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

export default FleetDashboard;

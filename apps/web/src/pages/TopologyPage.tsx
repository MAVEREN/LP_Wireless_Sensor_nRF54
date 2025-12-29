import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Sensors as SensorsIcon,
  Router as RouterIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface Organization {
  id: string;
  name: string;
  description: string;
}

interface Site {
  id: string;
  name: string;
  organizationId: string;
  sensorGroups?: SensorGroup[];
  hubs?: Hub[];
}

interface SensorGroup {
  id: string;
  name: string;
  siteId: string;
  nodes?: Node[];
}

interface Hub {
  id: string;
  deviceId: string;
  status: string;
  lastSeen?: Date;
}

interface Node {
  id: string;
  nodeId: string;
  status: string;
  batteryPercent?: number;
  lastReading?: any;
}

function TopologyPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [sensorGroups, setSensorGroups] = useState<SensorGroup[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'org' | 'site' | 'sensorGroup'>('org');
  const [formData, setFormData] = useState({ name: '', description: '' });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/topology/organizations`);
      setOrganizations(response.data);
    } catch (error) {
      console.error('Failed to load organizations:', error);
    }
  };

  const loadSites = async (orgId: string) => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/topology/organizations/${orgId}/sites`,
      );
      setSites(response.data);
    } catch (error) {
      console.error('Failed to load sites:', error);
    }
  };

  const loadSensorGroups = async (siteId: string) => {
    try {
      const response = await axios.get(
        `${apiUrl}/api/topology/sites/${siteId}/sensor-groups`,
      );
      setSensorGroups(response.data);
    } catch (error) {
      console.error('Failed to load sensorGroups:', error);
    }
  };

  const handleOrgSelect = (org: Organization) => {
    setSelectedOrg(org);
    setSelectedSite(null);
    loadSites(org.id);
  };

  const handleSiteSelect = (site: Site) => {
    setSelectedSite(site);
    loadSensorGroups(site.id);
  };

  const handleOpenDialog = (type: 'org' | 'site' | 'sensorGroup') => {
    setDialogType(type);
    setFormData({ name: '', description: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCreate = async () => {
    try {
      if (dialogType === 'org') {
        await axios.post(`${apiUrl}/api/topology/organizations`, formData);
        loadOrganizations();
      } else if (dialogType === 'site' && selectedOrg) {
        await axios.post(`${apiUrl}/api/topology/sites`, {
          ...formData,
          organizationId: selectedOrg.id,
        });
        loadSites(selectedOrg.id);
      } else if (dialogType === 'sensorGroup' && selectedSite) {
        await axios.post(`${apiUrl}/api/topology/sensor-groups`, {
          ...formData,
          siteId: selectedSite.id,
        });
        loadSensorGroups(selectedSite.id);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to create:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Topology Management
      </Typography>

      <Typography variant="body1" paragraph>
        Manage your organization structure: Organizations → Sites → Sensor Groups → Nodes
      </Typography>

      <Grid container spacing={3}>
        {/* Organizations */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Organizations</Typography>
                <IconButton size="small" onClick={() => handleOpenDialog('org')}>
                  <AddIcon />
                </IconButton>
              </Box>
              <List>
                {organizations.map((org) => (
                  <ListItem
                    key={org.id}
                    button
                    selected={selectedOrg?.id === org.id}
                    onClick={() => handleOrgSelect(org)}
                  >
                    <ListItemText primary={org.name} secondary={org.description} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Sites */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Sites</Typography>
                <IconButton
                  size="small"
                  disabled={!selectedOrg}
                  onClick={() => handleOpenDialog('site')}
                >
                  <AddIcon />
                </IconButton>
              </Box>
              {selectedOrg ? (
                <List>
                  {sites.map((site) => (
                    <ListItem
                      key={site.id}
                      button
                      selected={selectedSite?.id === site.id}
                      onClick={() => handleSiteSelect(site)}
                    >
                      <ListItemText
                        primary={site.name}
                        secondary={`${site.sensorGroups?.length || 0} sensor groups, ${site.hubs?.length || 0} hubs`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">Select an organization</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sensor Groups */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Sensor Groups</Typography>
                <IconButton
                  size="small"
                  disabled={!selectedSite}
                  onClick={() => handleOpenDialog('sensorGroup')}
                >
                  <AddIcon />
                </IconButton>
              </Box>
              {selectedSite ? (
                <List>
                  {sensorGroups.map((sensorGroup) => (
                    <ListItem key={sensorGroup.id}>
                      <ListItemText
                        primary={sensorGroup.name}
                        secondary={`${sensorGroup.nodes?.length || 0} nodes`}
                      />
                      <IconButton edge="end" size="small">
                        <EditIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">Select a site</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Node and Hub Summary */}
      {selectedSite && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <SensorsIcon sx={{ mr: 1 }} color="primary" />
                  <Typography variant="h6">Nodes at this Site</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Total nodes across all sensor groups: {sensorGroups.reduce((sum, m) => sum + (m.nodes?.length || 0), 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <RouterIcon sx={{ mr: 1 }} color="primary" />
                  <Typography variant="h6">Hubs at this Site</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Total hubs: {selectedSite.hubs?.length || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Create Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          Create New {dialogType === 'org' ? 'Organization' : dialogType === 'site' ? 'Site' : 'Sensor Group'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TopologyPage;

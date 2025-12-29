import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TopologyService } from './topology.service';
import { Organization } from './entities/organization.entity';
import { Site } from './entities/site.entity';
import { SensorGroup } from './entities/sensor-group.entity';
import { Hub } from './entities/hub.entity';
import { Node } from './entities/node.entity';

@ApiTags('topology')
@Controller('api/topology')
// @UseGuards(JwtAuthGuard) // Will be enabled once auth is complete
export class TopologyController {
  constructor(private readonly topologyService: TopologyService) {}

  // Organizations
  @Get('organizations')
  @ApiOperation({ summary: 'Get all organizations' })
  async getOrganizations(): Promise<Organization[]> {
    return this.topologyService.findAllOrganizations();
  }

  @Get('organizations/:id')
  @ApiOperation({ summary: 'Get organization by ID' })
  async getOrganization(@Param('id') id: string): Promise<Organization> {
    return this.topologyService.findOrganizationById(id);
  }

  @Post('organizations')
  @ApiOperation({ summary: 'Create organization' })
  async createOrganization(@Body() data: Partial<Organization>): Promise<Organization> {
    return this.topologyService.createOrganization(data);
  }

  // Sites
  @Get('organizations/:orgId/sites')
  @ApiOperation({ summary: 'Get sites for organization' })
  async getSitesByOrganization(@Param('orgId') orgId: string): Promise<Site[]> {
    return this.topologyService.findSitesByOrganization(orgId);
  }

  @Get('sites/:id')
  @ApiOperation({ summary: 'Get site by ID' })
  async getSite(@Param('id') id: string): Promise<Site> {
    return this.topologyService.findSiteById(id);
  }

  @Post('sites')
  @ApiOperation({ summary: 'Create site' })
  async createSite(@Body() data: Partial<Site>): Promise<Site> {
    return this.topologyService.createSite(data);
  }

  // Sensor Groups
  @Get('sites/:siteId/sensor-groups')
  @ApiOperation({ summary: 'Get sensor groups for site' })
  async getSensorGroupsBySite(@Param('siteId') siteId: string): Promise<SensorGroup[]> {
    return this.topologyService.findSensorGroupsBySite(siteId);
  }

  @Get('sensor-groups/:id')
  @ApiOperation({ summary: 'Get sensor group by ID' })
  async getSensorGroup(@Param('id') id: string): Promise<SensorGroup> {
    return this.topologyService.findSensorGroupById(id);
  }

  @Post('sensor-groups')
  @ApiOperation({ summary: 'Create sensor group' })
  async createSensorGroup(@Body() data: Partial<SensorGroup>): Promise<SensorGroup> {
    return this.topologyService.createSensorGroup(data);
  }

  // Hubs
  @Get('sites/:siteId/hubs')
  @ApiOperation({ summary: 'Get hubs for site' })
  async getHubsBySite(@Param('siteId') siteId: string): Promise<Hub[]> {
    return this.topologyService.findHubsBySite(siteId);
  }

  @Get('hubs/:id')
  @ApiOperation({ summary: 'Get hub by ID' })
  async getHub(@Param('id') id: string): Promise<Hub> {
    return this.topologyService.findHubById(id);
  }

  @Post('hubs')
  @ApiOperation({ summary: 'Create hub' })
  async createHub(@Body() data: Partial<Hub>): Promise<Hub> {
    return this.topologyService.createHub(data);
  }

  @Put('hubs/:id')
  @ApiOperation({ summary: 'Update hub' })
  async updateHub(@Param('id') id: string, @Body() data: Partial<Hub>): Promise<Hub> {
    return this.topologyService.updateHub(id, data);
  }

  // Nodes
  @Get('sensor-groups/:sensorGroupId/nodes')
  @ApiOperation({ summary: 'Get nodes for sensor group' })
  async getNodesBySensorGroup(@Param('sensorGroupId') sensorGroupId: string): Promise<Node[]> {
    return this.topologyService.findNodesBySensorGroup(sensorGroupId);
  }

  @Get('hubs/:hubId/nodes')
  @ApiOperation({ summary: 'Get nodes for hub' })
  async getNodesByHub(@Param('hubId') hubId: string): Promise<Node[]> {
    return this.topologyService.findNodesByHub(hubId);
  }

  @Get('nodes/:id')
  @ApiOperation({ summary: 'Get node by ID' })
  async getNode(@Param('id') id: string): Promise<Node> {
    return this.topologyService.findNodeById(id);
  }

  @Post('nodes')
  @ApiOperation({ summary: 'Create node' })
  async createNode(@Body() data: Partial<Node>): Promise<Node> {
    return this.topologyService.createNode(data);
  }

  @Put('nodes/:id')
  @ApiOperation({ summary: 'Update node' })
  async updateNode(@Param('id') id: string, @Body() data: Partial<Node>): Promise<Node> {
    return this.topologyService.updateNode(id, data);
  }

  @Put('nodes/:nodeId/assign/:sensorGroupId')
  @ApiOperation({ summary: 'Assign node to sensor group' })
  async assignNodeToSensorGroup(
    @Param('nodeId') nodeId: string,
    @Param('sensorGroupId') sensorGroupId: string,
  ): Promise<Node> {
    return this.topologyService.assignNodeToSensorGroup(nodeId, sensorGroupId);
  }

  @Put('nodes/:nodeId/bind/:hubId')
  @ApiOperation({ summary: 'Bind node to hub' })
  async bindNodeToHub(
    @Param('nodeId') nodeId: string,
    @Param('hubId') hubId: string,
  ): Promise<Node> {
    return this.topologyService.bindNodeToHub(nodeId, hubId);
  }
}

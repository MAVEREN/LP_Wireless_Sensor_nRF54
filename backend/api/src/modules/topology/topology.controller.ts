import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TopologyService } from './topology.service';
import { Organization } from './entities/organization.entity';
import { Site } from './entities/site.entity';
import { Machine } from './entities/machine.entity';
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

  // Machines
  @Get('sites/:siteId/machines')
  @ApiOperation({ summary: 'Get machines for site' })
  async getMachinesBySite(@Param('siteId') siteId: string): Promise<Machine[]> {
    return this.topologyService.findMachinesBySite(siteId);
  }

  @Get('machines/:id')
  @ApiOperation({ summary: 'Get machine by ID' })
  async getMachine(@Param('id') id: string): Promise<Machine> {
    return this.topologyService.findMachineById(id);
  }

  @Post('machines')
  @ApiOperation({ summary: 'Create machine' })
  async createMachine(@Body() data: Partial<Machine>): Promise<Machine> {
    return this.topologyService.createMachine(data);
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
  @Get('machines/:machineId/nodes')
  @ApiOperation({ summary: 'Get nodes for machine' })
  async getNodesByMachine(@Param('machineId') machineId: string): Promise<Node[]> {
    return this.topologyService.findNodesByMachine(machineId);
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

  @Put('nodes/:nodeId/assign/:machineId')
  @ApiOperation({ summary: 'Assign node to machine' })
  async assignNodeToMachine(
    @Param('nodeId') nodeId: string,
    @Param('machineId') machineId: string,
  ): Promise<Node> {
    return this.topologyService.assignNodeToMachine(nodeId, machineId);
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

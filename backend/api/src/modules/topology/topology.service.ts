import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { Site } from './entities/site.entity';
import { SensorGroup } from './entities/sensor-group.entity';
import { Hub } from './entities/hub.entity';
import { Node } from './entities/node.entity';

@Injectable()
export class TopologyService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(Site)
    private siteRepository: Repository<Site>,
    @InjectRepository(SensorGroup)
    private sensorGroupRepository: Repository<SensorGroup>,
    @InjectRepository(Hub)
    private hubRepository: Repository<Hub>,
    @InjectRepository(Node)
    private nodeRepository: Repository<Node>,
  ) {}

  // Organizations
  async findAllOrganizations(): Promise<Organization[]> {
    return this.organizationRepository.find({
      relations: ['sites'],
    });
  }

  async findOrganizationById(id: string): Promise<Organization> {
    return this.organizationRepository.findOne({
      where: { id },
      relations: ['sites', 'users'],
    });
  }

  async createOrganization(data: Partial<Organization>): Promise<Organization> {
    const organization = this.organizationRepository.create(data);
    return this.organizationRepository.save(organization);
  }

  // Sites
  async findSitesByOrganization(organizationId: string): Promise<Site[]> {
    return this.siteRepository.find({
      where: { organizationId },
      relations: ['sensorGroups', 'hubs'],
    });
  }

  async findSiteById(id: string): Promise<Site> {
    return this.siteRepository.findOne({
      where: { id },
      relations: ['organization', 'sensorGroups', 'hubs'],
    });
  }

  async createSite(data: Partial<Site>): Promise<Site> {
    const site = this.siteRepository.create(data);
    return this.siteRepository.save(site);
  }

  // Sensor Groups
  async findSensorGroupsBySite(siteId: string): Promise<SensorGroup[]> {
    return this.sensorGroupRepository.find({
      where: { siteId },
      relations: ['nodes'],
    });
  }

  async findSensorGroupById(id: string): Promise<SensorGroup> {
    return this.sensorGroupRepository.findOne({
      where: { id },
      relations: ['site', 'nodes'],
    });
  }

  async createSensorGroup(data: Partial<SensorGroup>): Promise<SensorGroup> {
    const sensorGroup = this.sensorGroupRepository.create(data);
    return this.sensorGroupRepository.save(sensorGroup);
  }

  // Hubs
  async findHubsBySite(siteId: string): Promise<Hub[]> {
    return this.hubRepository.find({
      where: { siteId },
      relations: ['nodes'],
    });
  }

  async findHubById(id: string): Promise<Hub> {
    return this.hubRepository.findOne({
      where: { id },
      relations: ['site', 'nodes'],
    });
  }

  async findHubByDeviceId(deviceId: string): Promise<Hub> {
    return this.hubRepository.findOne({
      where: { deviceId },
      relations: ['site', 'nodes'],
    });
  }

  async createHub(data: Partial<Hub>): Promise<Hub> {
    const hub = this.hubRepository.create(data);
    return this.hubRepository.save(hub);
  }

  async updateHub(id: string, data: Partial<Hub>): Promise<Hub> {
    await this.hubRepository.update(id, data);
    return this.findHubById(id);
  }

  // Nodes
  async findNodesBySensorGroup(sensorGroupId: string): Promise<Node[]> {
    return this.nodeRepository.find({
      where: { sensorGroupId },
      relations: ['hub'],
    });
  }

  async findNodesByHub(hubId: string): Promise<Node[]> {
    return this.nodeRepository.find({
      where: { hubId },
      relations: ['sensorGroup'],
    });
  }

  async findNodeById(id: string): Promise<Node> {
    return this.nodeRepository.findOne({
      where: { id },
      relations: ['sensorGroup', 'hub'],
    });
  }

  async findNodeByNodeId(nodeId: string): Promise<Node> {
    return this.nodeRepository.findOne({
      where: { nodeId },
      relations: ['sensorGroup', 'hub'],
    });
  }

  async createNode(data: Partial<Node>): Promise<Node> {
    const node = this.nodeRepository.create(data);
    return this.nodeRepository.save(node);
  }

  async updateNode(id: string, data: Partial<Node>): Promise<Node> {
    await this.nodeRepository.update(id, data);
    return this.findNodeById(id);
  }

  async assignNodeToSensorGroup(nodeId: string, sensorGroupId: string): Promise<Node> {
    const node = await this.findNodeByNodeId(nodeId);
    if (!node) {
      throw new Error('Node not found');
    }
    
    node.sensorGroupId = sensorGroupId;
    return this.nodeRepository.save(node);
  }

  async bindNodeToHub(nodeId: string, hubId: string): Promise<Node> {
    const node = await this.findNodeByNodeId(nodeId);
    if (!node) {
      throw new Error('Node not found');
    }
    
    node.hubId = hubId;
    return this.nodeRepository.save(node);
  }
}

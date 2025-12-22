import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { Site } from './entities/site.entity';
import { Machine } from './entities/machine.entity';
import { Hub } from './entities/hub.entity';
import { Node } from './entities/node.entity';

@Injectable()
export class TopologyService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(Site)
    private siteRepository: Repository<Site>,
    @InjectRepository(Machine)
    private machineRepository: Repository<Machine>,
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
      relations: ['machines', 'hubs'],
    });
  }

  async findSiteById(id: string): Promise<Site> {
    return this.siteRepository.findOne({
      where: { id },
      relations: ['organization', 'machines', 'hubs'],
    });
  }

  async createSite(data: Partial<Site>): Promise<Site> {
    const site = this.siteRepository.create(data);
    return this.siteRepository.save(site);
  }

  // Machines
  async findMachinesBySite(siteId: string): Promise<Machine[]> {
    return this.machineRepository.find({
      where: { siteId },
      relations: ['nodes'],
    });
  }

  async findMachineById(id: string): Promise<Machine> {
    return this.machineRepository.findOne({
      where: { id },
      relations: ['site', 'nodes'],
    });
  }

  async createMachine(data: Partial<Machine>): Promise<Machine> {
    const machine = this.machineRepository.create(data);
    return this.machineRepository.save(machine);
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
  async findNodesByMachine(machineId: string): Promise<Node[]> {
    return this.nodeRepository.find({
      where: { machineId },
      relations: ['hub'],
    });
  }

  async findNodesByHub(hubId: string): Promise<Node[]> {
    return this.nodeRepository.find({
      where: { hubId },
      relations: ['machine'],
    });
  }

  async findNodeById(id: string): Promise<Node> {
    return this.nodeRepository.findOne({
      where: { id },
      relations: ['machine', 'hub'],
    });
  }

  async findNodeByNodeId(nodeId: string): Promise<Node> {
    return this.nodeRepository.findOne({
      where: { nodeId },
      relations: ['machine', 'hub'],
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

  async assignNodeToMachine(nodeId: string, machineId: string): Promise<Node> {
    const node = await this.findNodeByNodeId(nodeId);
    if (!node) {
      throw new Error('Node not found');
    }
    
    node.machineId = machineId;
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

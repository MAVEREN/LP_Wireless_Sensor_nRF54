import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TopologyService } from './topology.service';
import { Organization } from './entities/organization.entity';
import { Site } from './entities/site.entity';
import { Machine } from './entities/machine.entity';
import { Node } from './entities/node.entity';
import { Hub } from './entities/hub.entity';

describe('TopologyService', () => {
  let service: TopologyService;
  let orgRepo: Repository<Organization>;
  let siteRepo: Repository<Site>;
  let machineRepo: Repository<Machine>;
  let nodeRepo: Repository<Node>;
  let hubRepo: Repository<Hub>;

  const mockOrganization = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Org',
    description: 'Test Organization',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSite = {
    id: '223e4567-e89b-12d3-a456-426614174000',
    name: 'Test Site',
    location: 'Test Location',
    organizationId: mockOrganization.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TopologyService,
        {
          provide: getRepositoryToken(Organization),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Site),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Machine),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Node),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Hub),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TopologyService>(TopologyService);
    orgRepo = module.get<Repository<Organization>>(
      getRepositoryToken(Organization),
    );
    siteRepo = module.get<Repository<Site>>(getRepositoryToken(Site));
    machineRepo = module.get<Repository<Machine>>(
      getRepositoryToken(Machine),
    );
    nodeRepo = module.get<Repository<Node>>(getRepositoryToken(Node));
    hubRepo = module.get<Repository<Hub>>(getRepositoryToken(Hub));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllOrganizations', () => {
    it('should return an array of organizations', async () => {
      const expected = [mockOrganization];
      jest.spyOn(orgRepo, 'find').mockResolvedValue(expected as any);

      const result = await service.findAllOrganizations();
      expect(result).toEqual(expected);
      expect(orgRepo.find).toHaveBeenCalled();
    });
  });

  describe('createOrganization', () => {
    it('should create and return an organization', async () => {
      const createDto = {
        name: 'Test Org',
        description: 'Test Organization',
      };

      jest.spyOn(orgRepo, 'create').mockReturnValue(mockOrganization as any);
      jest.spyOn(orgRepo, 'save').mockResolvedValue(mockOrganization as any);

      const result = await service.createOrganization(createDto);
      expect(result).toEqual(mockOrganization);
      expect(orgRepo.create).toHaveBeenCalledWith(createDto);
      expect(orgRepo.save).toHaveBeenCalled();
    });
  });

  describe('findSitesByOrganization', () => {
    it('should return sites for an organization', async () => {
      const expected = [mockSite];
      jest.spyOn(siteRepo, 'find').mockResolvedValue(expected as any);

      const result = await service.findSitesByOrganization(
        mockOrganization.id,
      );
      expect(result).toEqual(expected);
      expect(siteRepo.find).toHaveBeenCalledWith({
        where: { organizationId: mockOrganization.id },
        relations: ['machines', 'hubs'],
      });
    });
  });

  describe('createSite', () => {
    it('should create and return a site', async () => {
      const createDto = {
        name: 'Test Site',
        location: 'Test Location',
        organizationId: mockOrganization.id,
      };

      jest.spyOn(siteRepo, 'create').mockReturnValue(mockSite as any);
      jest.spyOn(siteRepo, 'save').mockResolvedValue(mockSite as any);

      const result = await service.createSite(createDto);
      expect(result).toEqual(mockSite);
      expect(siteRepo.create).toHaveBeenCalledWith(createDto);
      expect(siteRepo.save).toHaveBeenCalled();
    });
  });
});

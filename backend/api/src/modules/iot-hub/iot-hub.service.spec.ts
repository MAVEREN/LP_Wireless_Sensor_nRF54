import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { IotHubService } from './iot-hub.service';

// Mock azure-iothub module
jest.mock('azure-iothub', () => ({
  Registry: {
    fromConnectionString: jest.fn().mockReturnValue({
      getTwin: jest.fn(),
      updateTwin: jest.fn(),
      createQuery: jest.fn(),
    }),
  },
  Client: {
    fromConnectionString: jest.fn().mockReturnValue({
      invokeDeviceMethod: jest.fn(),
      send: jest.fn(),
    }),
  },
}));

describe('IotHubService', () => {
  let service: IotHubService;
  let configService: ConfigService;

  const mockDeviceId = 'test-hub-001';
  const mockTwin = {
    deviceId: mockDeviceId,
    properties: {
      desired: {
        schemaVersion: '1.0.0',
        jobs: [],
      },
      reported: {
        schemaVersion: '1.0.0',
        hubStatus: {
          firmwareVersion: '1.0.0',
          uptime: 3600,
        },
      },
    },
    connectionState: 'Connected',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IotHubService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('HostName=test.azure-devices.net;SharedAccessKeyName=service;SharedAccessKey=test'),
          },
        },
      ],
    }).compile();

    service = module.get<IotHubService>(IotHubService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize with connection string from config', () => {
    expect(configService.get).toHaveBeenCalledWith('IOT_HUB_CONNECTION_STRING');
  });

  describe('getDeviceTwin', () => {
    it('should return device twin', async () => {
      const mockRegistry = {
        getTwin: jest.fn().mockResolvedValue({ responseBody: mockTwin }),
      };
      (service as any).registry = mockRegistry;

      const result = await service.getDeviceTwin(mockDeviceId);
      expect(result).toEqual(mockTwin);
      expect(mockRegistry.getTwin).toHaveBeenCalledWith(mockDeviceId);
    });
  });

  describe('updateTwinDesiredProperties', () => {
    it('should update desired properties', async () => {
      const desiredProps = { jobs: [{ jobId: 'test-job' }] };
      const mockRegistry = {
        updateTwin: jest.fn().mockResolvedValue({ responseBody: mockTwin }),
      };
      (service as any).registry = mockRegistry;

      const result = await service.updateTwinDesiredProperties(
        mockDeviceId,
        desiredProps,
      );

      expect(mockRegistry.updateTwin).toHaveBeenCalledWith(
        mockDeviceId,
        {
          properties: {
            desired: desiredProps,
          },
        },
        '*',
      );
    });
  });

  describe('getTwinReportedProperties', () => {
    it('should return reported properties', async () => {
      const mockRegistry = {
        getTwin: jest.fn().mockResolvedValue({ responseBody: mockTwin }),
      };
      (service as any).registry = mockRegistry;

      const result = await service.getTwinReportedProperties(mockDeviceId);
      expect(result).toEqual(mockTwin.properties.reported);
    });
  });

  describe('addJobToTwin', () => {
    it('should add job to device twin', async () => {
      const job = {
        jobId: 'test-job-123',
        type: 'push_node_config',
        payload: {},
      };

      const currentTwin = {
        ...mockTwin,
        properties: {
          ...mockTwin.properties,
          desired: {
            ...mockTwin.properties.desired,
            jobs: [],
          },
        },
      };

      const mockRegistry = {
        getTwin: jest.fn().mockResolvedValue({ responseBody: currentTwin }),
        updateTwin: jest.fn().mockResolvedValue({ responseBody: currentTwin }),
      };
      (service as any).registry = mockRegistry;

      await service.addJobToTwin(mockDeviceId, job);

      expect(mockRegistry.getTwin).toHaveBeenCalledWith(mockDeviceId);
      expect(mockRegistry.updateTwin).toHaveBeenCalled();
    });
  });

  describe('updateTopologyMapping', () => {
    it('should update topology in device twin', async () => {
      const siteId = 'site-123';
      const nodeMappings = [
        { nodeId: 'AA:BB:CC:DD:EE:FF', sensorGroupId: 'sensor-group-123' },
      ];

      const mockRegistry = {
        getTwin: jest.fn().mockResolvedValue({ responseBody: mockTwin }),
        updateTwin: jest.fn().mockResolvedValue({ responseBody: mockTwin }),
      };
      (service as any).registry = mockRegistry;

      await service.updateTopologyMapping(mockDeviceId, siteId, nodeMappings);

      expect(mockRegistry.updateTwin).toHaveBeenCalled();
    });
  });

  describe('isDeviceConnected', () => {
    it('should return true when device is connected', async () => {
      const mockRegistry = {
        getTwin: jest.fn().mockResolvedValue({ responseBody: mockTwin }),
      };
      (service as any).registry = mockRegistry;

      const result = await service.isDeviceConnected(mockDeviceId);
      expect(result).toBe(true);
    });

    it('should return false when device is disconnected', async () => {
      const disconnectedTwin = {
        ...mockTwin,
        connectionState: 'Disconnected',
      };
      const mockRegistry = {
        getTwin: jest.fn().mockResolvedValue({ responseBody: disconnectedTwin }),
      };
      (service as any).registry = mockRegistry;

      const result = await service.isDeviceConnected(mockDeviceId);
      expect(result).toBe(false);
    });
  });
});

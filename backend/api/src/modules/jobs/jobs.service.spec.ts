import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobsService } from './jobs.service';
import { Job } from './entities/job.entity';
import { IotHubService } from '../iot-hub/iot-hub.service';

describe('JobsService', () => {
  let service: JobsService;
  let jobRepo: Repository<Job>;
  let iotHubService: IotHubService;

  const mockJob = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    type: 'push_node_config',
    status: 'queued',
    hubId: 'hub-001',
    nodeId: 'AA:BB:CC:DD:EE:FF',
    payload: { configuration: {} },
    createdBy: 'user-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    timeoutSeconds: 300,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        {
          provide: getRepositoryToken(Job),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              delete: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              execute: jest.fn().mockResolvedValue({ affected: 5 }),
            })),
          },
        },
        {
          provide: IotHubService,
          useValue: {
            addJobToTwin: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    jobRepo = module.get<Repository<Job>>(getRepositoryToken(Job));
    iotHubService = module.get<IotHubService>(IotHubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createJob', () => {
    it('should create and save a job', async () => {
      const jobData = {
        type: 'push_node_config',
        hubId: 'hub-001',
        nodeId: 'AA:BB:CC:DD:EE:FF',
        payload: {},
        createdBy: 'user-123',
      };

      jest.spyOn(jobRepo, 'create').mockReturnValue(mockJob as any);
      jest.spyOn(jobRepo, 'save').mockResolvedValue(mockJob as any);

      const result = await service.createJob(jobData);

      expect(result).toEqual(mockJob);
      expect(jobRepo.create).toHaveBeenCalled();
      expect(jobRepo.save).toHaveBeenCalled();
      expect(iotHubService.addJobToTwin).toHaveBeenCalled();
    });

    it('should handle job creation failure', async () => {
      const jobData = {
        type: 'push_node_config',
        hubId: 'hub-001',
        payload: {},
        createdBy: 'user-123',
      };

      jest.spyOn(jobRepo, 'create').mockReturnValue(mockJob as any);
      jest.spyOn(jobRepo, 'save').mockResolvedValue(mockJob as any);
      jest
        .spyOn(iotHubService, 'addJobToTwin')
        .mockRejectedValue(new Error('IoT Hub error'));

      const result = await service.createJob(jobData);

      expect(result.status).toBe('failed');
      expect(result.errorMessage).toBe('IoT Hub error');
    });
  });

  describe('findJobById', () => {
    it('should return a job by id', async () => {
      jest.spyOn(jobRepo, 'findOne').mockResolvedValue(mockJob as any);

      const result = await service.findJobById(mockJob.id);
      expect(result).toEqual(mockJob);
      expect(jobRepo.findOne).toHaveBeenCalledWith({ where: { id: mockJob.id } });
    });
  });

  describe('findJobsByHub', () => {
    it('should return jobs for a hub', async () => {
      const expected = [mockJob];
      jest.spyOn(jobRepo, 'find').mockResolvedValue(expected as any);

      const result = await service.findJobsByHub('hub-001');
      expect(result).toEqual(expected);
      expect(jobRepo.find).toHaveBeenCalledWith({
        where: { hubId: 'hub-001' },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('updateJobStatus', () => {
    it('should update job status', async () => {
      const updatedJob = { ...mockJob, status: 'succeeded' };

      jest.spyOn(jobRepo, 'findOne').mockResolvedValue(mockJob as any);
      jest.spyOn(jobRepo, 'save').mockResolvedValue(updatedJob as any);

      const result = await service.updateJobStatus(mockJob.id, 'succeeded');

      expect(result.status).toBe('succeeded');
      expect(jobRepo.save).toHaveBeenCalled();
    });

    it('should throw error if job not found', async () => {
      jest.spyOn(jobRepo, 'findOne').mockResolvedValue(null);

      await expect(service.updateJobStatus('invalid-id', 'succeeded')).rejects.toThrow();
    });
  });

  describe('cancelJob', () => {
    it('should cancel a job', async () => {
      const cancelledJob = { ...mockJob, status: 'cancelled' };

      jest.spyOn(jobRepo, 'findOne').mockResolvedValue(mockJob as any);
      jest.spyOn(jobRepo, 'save').mockResolvedValue(cancelledJob as any);

      const result = await service.cancelJob(mockJob.id);

      expect(result.status).toBe('cancelled');
    });
  });

  describe('getJobStatistics', () => {
    it('should return job statistics', async () => {
      jest.spyOn(jobRepo, 'count').mockResolvedValueOnce(100); // total
      jest.spyOn(jobRepo, 'count').mockResolvedValueOnce(10); // queued
      jest.spyOn(jobRepo, 'count').mockResolvedValueOnce(5); // running
      jest.spyOn(jobRepo, 'count').mockResolvedValueOnce(80); // succeeded
      jest.spyOn(jobRepo, 'count').mockResolvedValueOnce(5); // failed

      const result = await service.getJobStatistics();

      expect(result).toEqual({
        total: 100,
        queued: 10,
        running: 5,
        succeeded: 80,
        failed: 5,
      });
    });
  });

  describe('cleanupOldJobs', () => {
    it('should delete old completed jobs', async () => {
      const result = await service.cleanupOldJobs(30);

      expect(result).toBe(5);
    });
  });

  describe('specialized job creators', () => {
    it('should create push node config job', async () => {
      jest.spyOn(jobRepo, 'create').mockReturnValue(mockJob as any);
      jest.spyOn(jobRepo, 'save').mockResolvedValue(mockJob as any);

      const result = await service.createPushNodeConfigJob(
        'hub-001',
        'AA:BB:CC:DD:EE:FF',
        {},
        'user-123',
      );

      expect(result.type).toBe('push_node_config');
    });

    it('should create pull node diagnostics job', async () => {
      const diagJob = { ...mockJob, type: 'pull_node_diagnostics' };
      jest.spyOn(jobRepo, 'create').mockReturnValue(diagJob as any);
      jest.spyOn(jobRepo, 'save').mockResolvedValue(diagJob as any);

      const result = await service.createPullNodeDiagnosticsJob(
        'hub-001',
        'AA:BB:CC:DD:EE:FF',
        'user-123',
      );

      expect(result.type).toBe('pull_node_diagnostics');
    });

    it('should create firmware update job', async () => {
      const fwJob = { ...mockJob, type: 'update_hub_firmware' };
      jest.spyOn(jobRepo, 'create').mockReturnValue(fwJob as any);
      jest.spyOn(jobRepo, 'save').mockResolvedValue(fwJob as any);

      const result = await service.createFirmwareUpdateJob(
        'hub-001',
        {},
        'user-123',
      );

      expect(result.type).toBe('update_hub_firmware');
    });
  });
});

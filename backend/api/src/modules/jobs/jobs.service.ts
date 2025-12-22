import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from './entities/job.entity';
import { IotHubService } from '../iot-hub/iot-hub.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    private iotHubService: IotHubService,
  ) {}

  /**
   * Create a new job
   */
  async createJob(jobData: Partial<Job>): Promise<Job> {
    const job = this.jobRepository.create({
      ...jobData,
      status: 'queued',
      createdAt: new Date(),
    });

    const savedJob = await this.jobRepository.save(job);
    this.logger.log(`Created job ${savedJob.id} of type ${savedJob.type}`);

    // Send job to device twin if hub is specified
    if (savedJob.hubId) {
      try {
        await this.sendJobToHub(savedJob);
      } catch (error) {
        this.logger.error(`Failed to send job to hub:`, error.message);
        // Update job status to failed
        savedJob.status = 'failed';
        savedJob.errorMessage = error.message;
        await this.jobRepository.save(savedJob);
      }
    }

    return savedJob;
  }

  /**
   * Send job to hub via Device Twin
   */
  private async sendJobToHub(job: Job): Promise<void> {
    const jobPayload = {
      jobId: job.id,
      type: job.type,
      targetNodeId: job.nodeId,
      payload: job.payload,
      createdAt: job.createdAt.toISOString(),
      timeoutSeconds: job.timeoutSeconds || 300,
    };

    await this.iotHubService.addJobToTwin(job.hubId, jobPayload);
    this.logger.log(`Sent job ${job.id} to hub ${job.hubId}`);
  }

  /**
   * Get job by ID
   */
  async findJobById(id: string): Promise<Job> {
    return this.jobRepository.findOne({ where: { id } });
  }

  /**
   * Get all jobs for a hub
   */
  async findJobsByHub(hubId: string): Promise<Job[]> {
    return this.jobRepository.find({
      where: { hubId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get jobs by status
   */
  async findJobsByStatus(status: string): Promise<Job[]> {
    return this.jobRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update job status
   */
  async updateJobStatus(
    id: string,
    status: string,
    errorCode?: string,
    errorMessage?: string,
    result?: any,
  ): Promise<Job> {
    const job = await this.findJobById(id);
    if (!job) {
      throw new Error(`Job ${id} not found`);
    }

    job.status = status;
    job.updatedAt = new Date();

    if (status === 'running' && !job.startedAt) {
      job.startedAt = new Date();
    }

    if (status === 'succeeded' || status === 'failed' || status === 'timeout') {
      job.completedAt = new Date();
    }

    if (errorCode) {
      job.errorCode = errorCode;
    }

    if (errorMessage) {
      job.errorMessage = errorMessage;
    }

    if (result) {
      job.result = result;
    }

    const updatedJob = await this.jobRepository.save(job);
    this.logger.log(`Updated job ${id} to status ${status}`);

    return updatedJob;
  }

  /**
   * Process job result from device twin reported properties
   */
  async processJobResult(hubId: string, jobResult: any): Promise<void> {
    const { jobId, status, errorCode, errorMessage, diagnostics } = jobResult;

    try {
      await this.updateJobStatus(
        jobId,
        status,
        errorCode,
        errorMessage,
        diagnostics,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process job result for ${jobId}:`,
        error.message,
      );
    }
  }

  /**
   * Cancel a job
   */
  async cancelJob(id: string): Promise<Job> {
    return this.updateJobStatus(id, 'cancelled');
  }

  /**
   * Create push node config job
   */
  async createPushNodeConfigJob(
    hubId: string,
    nodeId: string,
    configuration: any,
    createdBy: string,
  ): Promise<Job> {
    return this.createJob({
      type: 'push_node_config',
      hubId,
      nodeId,
      payload: { configuration },
      createdBy,
      timeoutSeconds: 300,
    });
  }

  /**
   * Create pull node diagnostics job
   */
  async createPullNodeDiagnosticsJob(
    hubId: string,
    nodeId: string,
    createdBy: string,
  ): Promise<Job> {
    return this.createJob({
      type: 'pull_node_diagnostics',
      hubId,
      nodeId,
      payload: {},
      createdBy,
      timeoutSeconds: 180,
    });
  }

  /**
   * Create firmware update job
   */
  async createFirmwareUpdateJob(
    hubId: string,
    firmwareUpdate: any,
    createdBy: string,
  ): Promise<Job> {
    return this.createJob({
      type: 'update_hub_firmware',
      hubId,
      payload: firmwareUpdate,
      createdBy,
      timeoutSeconds: 600,
    });
  }

  /**
   * Get job statistics
   */
  async getJobStatistics(): Promise<any> {
    const total = await this.jobRepository.count();
    const queued = await this.jobRepository.count({
      where: { status: 'queued' },
    });
    const running = await this.jobRepository.count({
      where: { status: 'running' },
    });
    const succeeded = await this.jobRepository.count({
      where: { status: 'succeeded' },
    });
    const failed = await this.jobRepository.count({
      where: { status: 'failed' },
    });

    return {
      total,
      queued,
      running,
      succeeded,
      failed,
    };
  }

  /**
   * Clean up old completed jobs
   */
  async cleanupOldJobs(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.jobRepository
      .createQueryBuilder()
      .delete()
      .where('status IN (:...statuses)', {
        statuses: ['succeeded', 'failed', 'timeout', 'cancelled'],
      })
      .andWhere('completedAt < :cutoffDate', { cutoffDate })
      .execute();

    this.logger.log(`Cleaned up ${result.affected} old jobs`);
    return result.affected || 0;
  }
}

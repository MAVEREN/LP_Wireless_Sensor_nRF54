import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { Job } from './entities/job.entity';

@ApiTags('jobs')
@Controller('api/jobs')
// @UseGuards(JwtAuthGuard) // Will be enabled once auth is complete
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job' })
  async createJob(@Body() jobData: Partial<Job>): Promise<Job> {
    return this.jobsService.createJob(jobData);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by ID' })
  async getJob(@Param('id') id: string): Promise<Job> {
    return this.jobsService.findJobById(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get jobs by status or hub' })
  async getJobs(
    @Query('hubId') hubId?: string,
    @Query('status') status?: string,
  ): Promise<Job[]> {
    if (hubId) {
      return this.jobsService.findJobsByHub(hubId);
    }
    if (status) {
      return this.jobsService.findJobsByStatus(status);
    }
    // Return all jobs (should be paginated in production)
    return this.jobsService.findJobsByStatus('queued');
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update job status' })
  async updateJobStatus(
    @Param('id') id: string,
    @Body()
    statusUpdate: {
      status: string;
      errorCode?: string;
      errorMessage?: string;
      result?: any;
    },
  ): Promise<Job> {
    return this.jobsService.updateJobStatus(
      id,
      statusUpdate.status,
      statusUpdate.errorCode,
      statusUpdate.errorMessage,
      statusUpdate.result,
    );
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel a job' })
  async cancelJob(@Param('id') id: string): Promise<Job> {
    return this.jobsService.cancelJob(id);
  }

  @Post('push-node-config')
  @ApiOperation({ summary: 'Create push node configuration job' })
  async pushNodeConfig(
    @Body()
    params: {
      hubId: string;
      nodeId: string;
      configuration: any;
      createdBy: string;
    },
  ): Promise<Job> {
    return this.jobsService.createPushNodeConfigJob(
      params.hubId,
      params.nodeId,
      params.configuration,
      params.createdBy,
    );
  }

  @Post('pull-node-diagnostics')
  @ApiOperation({ summary: 'Create pull node diagnostics job' })
  async pullNodeDiagnostics(
    @Body() params: { hubId: string; nodeId: string; createdBy: string },
  ): Promise<Job> {
    return this.jobsService.createPullNodeDiagnosticsJob(
      params.hubId,
      params.nodeId,
      params.createdBy,
    );
  }

  @Post('update-hub-firmware')
  @ApiOperation({ summary: 'Create firmware update job' })
  async updateHubFirmware(
    @Body()
    params: {
      hubId: string;
      firmwareUpdate: any;
      createdBy: string;
    },
  ): Promise<Job> {
    return this.jobsService.createFirmwareUpdateJob(
      params.hubId,
      params.firmwareUpdate,
      params.createdBy,
    );
  }

  @Get('statistics/summary')
  @ApiOperation({ summary: 'Get job statistics' })
  async getStatistics() {
    return this.jobsService.getJobStatistics();
  }

  @Post('cleanup')
  @ApiOperation({ summary: 'Clean up old completed jobs' })
  async cleanupOldJobs(@Body() params: { daysOld?: number }) {
    const count = await this.jobsService.cleanupOldJobs(params.daysOld || 30);
    return { message: `Cleaned up ${count} old jobs` };
  }
}

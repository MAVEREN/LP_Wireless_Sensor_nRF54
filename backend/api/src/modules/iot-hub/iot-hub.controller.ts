import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IotHubService } from './iot-hub.service';

@ApiTags('iot-hub')
@Controller('api/iot-hub')
// @UseGuards(JwtAuthGuard) // Will be enabled once auth is complete
export class IotHubController {
  constructor(private readonly iotHubService: IotHubService) {}

  @Get('devices/:deviceId/twin')
  @ApiOperation({ summary: 'Get device twin for a hub' })
  async getDeviceTwin(@Param('deviceId') deviceId: string) {
    return this.iotHubService.getDeviceTwin(deviceId);
  }

  @Get('devices/:deviceId/twin/reported')
  @ApiOperation({ summary: 'Get device twin reported properties' })
  async getReportedProperties(@Param('deviceId') deviceId: string) {
    return this.iotHubService.getTwinReportedProperties(deviceId);
  }

  @Post('devices/:deviceId/twin/desired')
  @ApiOperation({ summary: 'Update device twin desired properties' })
  async updateDesiredProperties(
    @Param('deviceId') deviceId: string,
    @Body() desiredProperties: any,
  ) {
    return this.iotHubService.updateTwinDesiredProperties(
      deviceId,
      desiredProperties,
    );
  }

  @Post('devices/:deviceId/jobs')
  @ApiOperation({ summary: 'Add job to device twin' })
  async addJob(@Param('deviceId') deviceId: string, @Body() job: any) {
    return this.iotHubService.addJobToTwin(deviceId, job);
  }

  @Post('devices/:deviceId/topology')
  @ApiOperation({ summary: 'Update topology mapping' })
  async updateTopology(
    @Param('deviceId') deviceId: string,
    @Body() topology: { siteId: string; nodeMappings: any[] },
  ) {
    return this.iotHubService.updateTopologyMapping(
      deviceId,
      topology.siteId,
      topology.nodeMappings,
    );
  }

  @Post('devices/:deviceId/policies')
  @ApiOperation({ summary: 'Update hub policies' })
  async updatePolicies(
    @Param('deviceId') deviceId: string,
    @Body() policies: any,
  ) {
    return this.iotHubService.updateHubPolicies(deviceId, policies);
  }

  @Post('devices/:deviceId/method')
  @ApiOperation({ summary: 'Invoke direct method on device' })
  async invokeMethod(
    @Param('deviceId') deviceId: string,
    @Body() params: { methodName: string; payload: any },
  ) {
    return this.iotHubService.invokeDeviceMethod(
      deviceId,
      params.methodName,
      params.payload,
    );
  }

  @Get('devices/:deviceId/connected')
  @ApiOperation({ summary: 'Check if device is connected' })
  async isDeviceConnected(@Param('deviceId') deviceId: string) {
    const connected = await this.iotHubService.isDeviceConnected(deviceId);
    return { deviceId, connected };
  }

  @Post('query')
  @ApiOperation({ summary: 'Query devices using IoT Hub query language' })
  async queryDevices(@Body() params: { query: string }) {
    return this.iotHubService.queryDevices(params.query);
  }
}

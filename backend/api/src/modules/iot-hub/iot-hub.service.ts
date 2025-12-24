import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Registry, Client as ServiceClient } from 'azure-iothub';
import { Twin } from 'azure-iothub';

@Injectable()
export class IotHubService {
  private readonly logger = new Logger(IotHubService.name);
  private registry: Registry;
  private serviceClient: ServiceClient;

  constructor(private configService: ConfigService) {
    const connectionString = this.configService.get<string>(
      'IOT_HUB_CONNECTION_STRING',
    );
    
    if (connectionString) {
      this.registry = Registry.fromConnectionString(connectionString);
      this.serviceClient = ServiceClient.fromConnectionString(connectionString);
      this.logger.log('IoT Hub service initialized');
    } else {
      this.logger.warn('IoT Hub connection string not configured');
    }
  }

  /**
   * Get device twin for a hub
   */
  async getDeviceTwin(deviceId: string): Promise<Twin> {
    try {
      const twin = await this.registry.getTwin(deviceId);
      return twin.responseBody;
    } catch (error) {
      this.logger.error(`Failed to get twin for ${deviceId}:`, error.message);
      throw error;
    }
  }

  /**
   * Update device twin desired properties
   */
  async updateTwinDesiredProperties(
    deviceId: string,
    desiredProperties: any,
  ): Promise<Twin> {
    try {
      const patch = {
        properties: {
          desired: desiredProperties,
        },
      };
      
      const twin = await this.registry.updateTwin(deviceId, patch, '*');
      this.logger.log(`Updated desired properties for ${deviceId}`);
      return twin.responseBody;
    } catch (error) {
      this.logger.error(
        `Failed to update desired properties for ${deviceId}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Get device twin reported properties
   */
  async getTwinReportedProperties(deviceId: string): Promise<any> {
    try {
      const twin = await this.getDeviceTwin(deviceId);
      return twin.properties.reported;
    } catch (error) {
      this.logger.error(
        `Failed to get reported properties for ${deviceId}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Add job to device twin desired properties
   */
  async addJobToTwin(deviceId: string, job: any): Promise<Twin> {
    try {
      const twin = await this.getDeviceTwin(deviceId);
      const currentJobs = twin.properties.desired?.jobs || [];
      
      // Add new job to the queue
      const updatedJobs = [...currentJobs, job];
      
      return this.updateTwinDesiredProperties(deviceId, {
        ...twin.properties.desired,
        jobs: updatedJobs,
      });
    } catch (error) {
      this.logger.error(`Failed to add job for ${deviceId}:`, error.message);
      throw error;
    }
  }

  /**
   * Update topology mapping in device twin
   */
  async updateTopologyMapping(
    deviceId: string,
    siteId: string,
    nodeMappings: Array<{ nodeId: string; machineId: string }>,
  ): Promise<Twin> {
    try {
      const twin = await this.getDeviceTwin(deviceId);
      
      return this.updateTwinDesiredProperties(deviceId, {
        ...twin.properties.desired,
        topology: {
          siteId,
          nodeMappings,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to update topology for ${deviceId}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Update hub policies in device twin
   */
  async updateHubPolicies(deviceId: string, policies: any): Promise<Twin> {
    try {
      const twin = await this.getDeviceTwin(deviceId);
      
      return this.updateTwinDesiredProperties(deviceId, {
        ...twin.properties.desired,
        policies,
      });
    } catch (error) {
      this.logger.error(
        `Failed to update policies for ${deviceId}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Invoke direct method on device
   */
  async invokeDeviceMethod(
    deviceId: string,
    methodName: string,
    payload: any,
  ): Promise<any> {
    try {
      const params = {
        methodName,
        payload,
        responseTimeoutInSeconds: 30,
        connectTimeoutInSeconds: 15,
      };

      const result = await this.serviceClient.invokeDeviceMethod(
        deviceId,
        params,
      );
      this.logger.log(`Invoked method ${methodName} on ${deviceId}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to invoke method ${methodName} on ${deviceId}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Send cloud-to-device message
   */
  async sendC2DMessage(deviceId: string, message: any): Promise<void> {
    try {
      const msg = new (require('azure-iot-common').Message)(
        JSON.stringify(message),
      );
      msg.messageId = `msg-${Date.now()}`;
      
      await this.serviceClient.send(deviceId, msg);
      this.logger.log(`Sent C2D message to ${deviceId}`);
    } catch (error) {
      this.logger.error(
        `Failed to send C2D message to ${deviceId}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Query devices
   */
  async queryDevices(query: string): Promise<any[]> {
    try {
      const results = [];
      const queryResult = this.registry.createQuery(query);
      
      while (queryResult.hasMoreResults) {
        const page = await queryResult.nextAsTwin();
        results.push(...page);
      }
      
      return results;
    } catch (error) {
      this.logger.error('Failed to query devices:', error.message);
      throw error;
    }
  }

  /**
   * Get all hubs with specific tag
   */
  async getHubsByTag(tagName: string, tagValue: string): Promise<any[]> {
    const query = `SELECT * FROM devices WHERE tags.${tagName} = '${tagValue}'`;
    return this.queryDevices(query);
  }

  /**
   * Check if device is connected
   */
  async isDeviceConnected(deviceId: string): Promise<boolean> {
    try {
      const twin = await this.getDeviceTwin(deviceId);
      return twin.connectionState === 'Connected';
    } catch (error) {
      this.logger.error(
        `Failed to check connection for ${deviceId}:`,
        error.message,
      );
      return false;
    }
  }
}

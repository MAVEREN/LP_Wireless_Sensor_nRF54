import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IotHubService } from './iot-hub.service';
import { IotHubController } from './iot-hub.controller';

@Module({
  imports: [ConfigModule],
  controllers: [IotHubController],
  providers: [IotHubService],
  exports: [IotHubService],
})
export class IotHubModule {}

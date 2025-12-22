import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { TopologyModule } from './modules/topology/topology.module';
import { DevicesModule } from './modules/devices/devices.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { IotHubModule } from './modules/iot-hub/iot-hub.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'industrial_sensor',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production', // Only for dev
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    TopologyModule,
    DevicesModule,
    JobsModule,
    IotHubModule,
  ],
})
export class AppModule {}

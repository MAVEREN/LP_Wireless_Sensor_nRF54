import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { Site } from './entities/site.entity';
import { Machine } from './entities/machine.entity';
import { Hub } from './entities/hub.entity';
import { Node } from './entities/node.entity';
import { User } from './entities/user.entity';
import { TopologyController } from './topology.controller';
import { TopologyService } from './topology.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      Site,
      Machine,
      Hub,
      Node,
      User,
    ]),
  ],
  controllers: [TopologyController],
  providers: [TopologyService],
  exports: [TopologyService],
})
export class TopologyModule {}

import { Module } from '@nestjs/common';
import { RewardsModule } from './rewards/rewards.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule, RewardsModule],
})
export class AppModule {}

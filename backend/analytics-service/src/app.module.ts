import { Module } from '@nestjs/common';
import { AnalyticsModule } from './analytics/analytics.module';
import { DatabaseModule } from './database/database.module';

@Module({
    imports: [DatabaseModule, AnalyticsModule],
})
export class AppModule { }

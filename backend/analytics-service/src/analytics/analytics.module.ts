import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Metric, MetricSchema } from './schemas/metric.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Metric.name, schema: MetricSchema }]),
        HttpModule,
    ],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
    exports: [AnalyticsService],
})
export class AnalyticsModule { }

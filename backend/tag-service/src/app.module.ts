import { Module } from '@nestjs/common';
import { TagsModule } from './tags/tags.module';
import { DatabaseModule } from './database/database.module';

@Module({
    imports: [DatabaseModule, TagsModule],
})
export class AppModule { }

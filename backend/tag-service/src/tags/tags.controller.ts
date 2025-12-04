import { Controller, Get, Post, Put, Delete, Body, Param, Headers } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';

@Controller('tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) { }

    @Post()
    create(@Headers('user-id') userId: string, @Body() createTagDto: CreateTagDto) {
        return this.tagsService.create(userId, createTagDto);
    }

    @Get()
    findAll(@Headers('user-id') userId: string) {
        return this.tagsService.findAll(userId);
    }

    @Get('templates')
    getTemplates() {
        return this.tagsService.getTemplates();
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Headers('user-id') userId: string) {
        return this.tagsService.findOne(id, userId);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Headers('user-id') userId: string,
        @Body() updateTagDto: UpdateTagDto,
    ) {
        return this.tagsService.update(id, userId, updateTagDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Headers('user-id') userId: string) {
        return this.tagsService.remove(id, userId);
    }
}

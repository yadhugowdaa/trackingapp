import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tag, TagDocument } from './schemas/tag.schema';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto';

@Injectable()
export class TagsService {
    constructor(@InjectModel(Tag.name) private tagModel: Model<TagDocument>) { }

    async create(userId: string, createTagDto: CreateTagDto) {
        // Check if tag with same name already exists for this user
        const existingTag = await this.tagModel.findOne({
            userId: new Types.ObjectId(userId),
            name: createTagDto.name,
        });

        if (existingTag) {
            throw new ConflictException('Tag with this name already exists');
        }

        const tag = new this.tagModel({
            ...createTagDto,
            userId: new Types.ObjectId(userId),
        });

        await tag.save();
        return tag;
    }

    async findAll(userId: string) {
        return this.tagModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).exec();
    }

    async findOne(id: string, userId: string) {
        const tag = await this.tagModel.findOne({
            _id: new Types.ObjectId(id),
            userId: new Types.ObjectId(userId),
        }).exec();

        if (!tag) {
            throw new NotFoundException('Tag not found');
        }

        return tag;
    }

    async update(id: string, userId: string, updateTagDto: UpdateTagDto) {
        const tag = await this.findOne(id, userId);

        // If updating name, check for duplicates
        if (updateTagDto.name) {
            const existingTag = await this.tagModel.findOne({
                userId: new Types.ObjectId(userId),
                name: updateTagDto.name,
                _id: { $ne: new Types.ObjectId(id) },
            });

            if (existingTag) {
                throw new ConflictException('Tag with this name already exists');
            }
        }

        Object.assign(tag, updateTagDto);
        await tag.save();
        return tag;
    }

    async remove(id: string, userId: string) {
        const tag = await this.findOne(id, userId);
        await tag.deleteOne();
        return { message: 'Tag deleted successfully' };
    }

    // Predefined popular tag templates
    async getTemplates() {
        return [
            { name: 'Office', color: '#34C759' },      // Green
            { name: 'Household', color: '#007AFF' },   // Blue
            { name: 'Urgent', color: '#FF3B30' },      // Red
            { name: 'Personal', color: '#AF52DE' },    // Purple
            { name: 'Work', color: '#FF9500' },        // Orange
            { name: 'Study', color: '#5856D6' },       // Indigo
            { name: 'Health', color: '#FF2D55' },      // Pink
            { name: 'Finance', color: '#FFD60A' },     // Yellow
            { name: 'Family', color: '#32ADE6' },      // Light Blue
            { name: 'Creative', color: '#BF5AF2' },    // Magenta
        ];
    }
}

import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateTagDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
        message: 'Color must be a valid hex color code (e.g., #34C759)',
    })
    color: string;
}

export class UpdateTagDto {
    @IsString()
    name?: string;

    @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
        message: 'Color must be a valid hex color code (e.g., #34C759)',
    })
    color?: string;
}

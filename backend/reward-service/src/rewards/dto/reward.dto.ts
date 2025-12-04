import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateRewardDto {
  @IsNotEmpty()
  @IsString()
  appPackageName: string;

  @IsNotEmpty()
  @IsString()
  appName: string;

  @IsOptional()
  @IsString()
  appIcon: string;

  @IsOptional()
  @IsNumber()
  dailyLimit: number;
}

export class UpdateUsageDto {
  @IsNotEmpty()
  @IsNumber()
  usageMinutes: number;
}

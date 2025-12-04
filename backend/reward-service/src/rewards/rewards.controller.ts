import { Controller, Get, Post, Delete, Body, Param, Headers } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { CreateRewardDto, UpdateUsageDto } from './dto/reward.dto';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Post()
  addApp(@Headers('user-id') userId: string, @Body() createRewardDto: CreateRewardDto) {
    return this.rewardsService.addApp(userId, createRewardDto);
  }

  @Get()
  getApps(@Headers('user-id') userId: string) {
    return this.rewardsService.getApps(userId);
  }

  @Get(':id/status')
  getAppStatus(@Param('id') id: string, @Headers('user-id') userId: string) {
    return this.rewardsService.getAppStatus(id, userId);
  }

  @Get(':id/eligibility')
  checkEligibility(@Param('id') id: string, @Headers('user-id') userId: string) {
    return this.rewardsService.checkUnlockEligibility(userId, id);
  }

  @Post(':id/unlock')
  unlockApp(@Param('id') id: string, @Headers('user-id') userId: string) {
    return this.rewardsService.unlockApp(id, userId);
  }

  @Post(':id/retrieve')
  retrieveReward(@Param('id') id: string, @Headers('user-id') userId: string) {
    return this.rewardsService.retrieveReward(id, userId);
  }

  @Post(':id/usage')
  updateUsage(
    @Param('id') id: string,
    @Headers('user-id') userId: string,
    @Body() updateUsageDto: UpdateUsageDto,
  ) {
    return this.rewardsService.updateUsage(id, userId, updateUsageDto);
  }

  @Delete(':id')
  removeApp(@Param('id') id: string, @Headers('user-id') userId: string) {
    return this.rewardsService.removeApp(id, userId);
  }
}

import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Request,
  UnprocessableEntityException,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { SolanaService } from '../solana/solana.service';
import { UserDto } from './dtos/user.dto';
import { aTob } from '../common/utils/repository.util';
import { UserTransactionDto } from './dtos/user-transaction.dto';

@ApiTags('User')
@Controller('api/v0/users')
export class UsersController {
  constructor(
    private userService: UsersService,
    private solanaService: SolanaService
  ) {
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'userId', required: true })
  @ApiOkResponse({ type: UserDto })
  @Get(':userId')
  async getUserById(
    @Request() req,
    @Param('userId') userId: string
  ): Promise<UserDto> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user.toDto();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: UserDto })
  @ApiOperation({ summary: 'Create a new account with 1(LAMPORT) airdrop' })
  @Post('create-account')
  async createAccount(@Request() req): Promise<UserDto> {
    let user = await this.userService.findByEmail(req.user.email);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const ownerAccount = this.solanaService.createAccount();
    await this.solanaService.airdrop(ownerAccount);
    user.ownerPrivateKey = aTob(ownerAccount.secretKey);
    user = await this.userService.updateUser(user);
    return this.userService.getUserDto(user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: UserDto })
  @ApiOperation({ summary: 'Create a stake account with authorized account' })
  @Post('create-stake-account')
  async createStakeAccount(@Request() req): Promise<UserDto> {
    let user = await this.userService.findByEmail(req.user.email);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const stakeAccount = this.solanaService.createAccount();
    const authorizedAccount = this.solanaService.createAccount();
    user.stakePrivateKey = aTob(stakeAccount.secretKey);
    user.authorizedPrivateKey = aTob(authorizedAccount.secretKey);
    user = await this.userService.updateUser(user);
    return this.userService.getUserDto(user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: UserDto })
  @ApiOperation({ summary: 'process stake flow' })
  @Post('stake')
  async stake(@Request() req, @Body() dto: UserTransactionDto): Promise<UserDto> {
    let user = await this.userService.findByEmail(req.user.email);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    try {
      await this.solanaService.stake(user, dto.amount);
    } catch (e) {
      throw new UnprocessableEntityException('Staking transaction failed. Probably it\'s because of the insufficient amount of gas');
    }
    return this.userService.getUserDto(user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: UserDto })
  @ApiOperation({ summary: 'process withdraw flow' })
  @Post('withdraw')
  async withdraw(@Request() req, @Body() dto: UserTransactionDto): Promise<UserDto> {
    let user = await this.userService.findByEmail(req.user.email);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    try {
      await this.solanaService.withdraw(user, dto.amount);
    } catch (e) {
      throw new UnprocessableEntityException('Staking transaction failed. Probably it\'s because of the insufficient amount of gas');
    }
    return this.userService.getUserDto(user);
  }
}

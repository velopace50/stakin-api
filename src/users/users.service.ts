import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from './entities/user.entity';
import { RegisterUserDto } from '../auth/dtos/register-user.dto';
import { getFromDto } from '../common/utils/repository.util';
import { UserDto } from './dtos/user.dto';
import { SolanaService } from '../solana/solana.service';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private solanaService: SolanaService,
  ) {}

  async findByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findOne({ email });
  }

  async findById(id: string): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async addUser(dto: RegisterUserDto, throwErrors = true): Promise<UserEntity> {
    const found = await this.findByEmail(dto.email);
    if (found) {
      if (throwErrors) {
        throw new BadRequestException('Email is already used.');
      }
      return found;
    }
    const user = getFromDto<UserEntity>(dto, new UserEntity());
    user.ownerPrivateKey = '';
    return this.userRepository.save(user);
  }

  updateUser(user: UserEntity): Promise<UserEntity> {
    return this.userRepository.save(user);
  }

  async count(): Promise<number> {
    return this.userRepository.count();
  }

  getUserDto(user: UserEntity): UserDto {
    const ownerPubKey = user.ownerPrivateKey ? this.solanaService.generatePubKeyStr(user.ownerPrivateKey) : '';
    const stakePubKey = user.stakePrivateKey ? this.solanaService.generatePubKeyStr(user.stakePrivateKey) : '';
    const authorizedPubKey = user.authorizedPrivateKey ? this.solanaService.generatePubKeyStr(user.authorizedPrivateKey) : '';
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      ownerPubKey,
      stakePubKey,
      authorizedPubKey,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

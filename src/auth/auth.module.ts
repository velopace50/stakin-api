import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { jwtConstants } from './constants';
import { AuthController } from './auth.controller';
import { SolanaService } from '../solana/solana.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'JWT_SECRET',
      signOptions: { expiresIn: jwtConstants.accessTokenExpiration },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, SolanaService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}

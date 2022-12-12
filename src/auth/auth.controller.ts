import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserDto } from '../users/dtos/user.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterUserDto } from './dtos/register-user.dto';
import { TokenResponse } from '../common/models/token.response';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@ApiTags('Authentication')
@Controller('api/v0/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @ApiOperation({
    summary: 'Login with email and password.',
    description:
      'Returns access token when the login is successful. Otherwise UnauthorizedException will occur.',
  })
  @ApiOkResponse({ type: TokenResponse, description: 'Returns access token.' })
  @ApiBody({ type: LoginDto })
  @Post('login')
  async login(@Request() req): Promise<TokenResponse> {
    return this.authService.login(req.user);
  }

  @ApiBearerAuth()
  @ApiOkResponse({ type: UserDto })
  @ApiOperation({ summary: 'Get user info' })
  @UseGuards(JwtAuthGuard)
  @Get('')
  async getAuthInfo(@Request() req): Promise<UserDto> {
    let user = await this.userService.findById(req.user.id);
    return this.userService.getUserDto(user);
  }

  @ApiOkResponse({ type: TokenResponse })
  @ApiOperation({
    summary: 'Register a general user',
    description: 'Register a user with email address and full name.',
  })
  @Post('register')
  register(@Body() dto: RegisterUserDto): Promise<TokenResponse> {
    return this.authService.registerUser(dto);
  }
}

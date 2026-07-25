import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';
import { LOGIN_RATE_LIMIT } from './auth.constants';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { AdminProfileDto, LoginResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import type { AuthenticatedAdmin } from './interfaces/jwt-payload.interface';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { ttl: LOGIN_RATE_LIMIT.ttl, limit: LOGIN_RATE_LIMIT.limit } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Signed in successfully')
  @ApiOperation({ summary: 'Exchange admin credentials for an access token' })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  @ApiTooManyRequestsResponse({ description: 'Too many login attempts — try again shortly' })
  login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ResponseMessage('Session is valid')
  @ApiOperation({ summary: 'Validate the current token and return the signed-in admin' })
  @ApiOkResponse({ type: AdminProfileDto })
  @ApiUnauthorizedResponse({ description: 'Missing, expired or invalid token' })
  me(@CurrentUser() admin: AuthenticatedAdmin): AdminProfileDto {
    return admin;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ResponseMessage('Signed out successfully')
  @ApiOperation({ summary: 'End the current session' })
  @ApiOkResponse({ type: AdminProfileDto })
  logout(@CurrentUser() admin: AuthenticatedAdmin): AdminProfileDto {
    return this.authService.logout(admin);
  }
}

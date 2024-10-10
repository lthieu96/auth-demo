import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { Public } from './guards/public.guard';
import { ActiveUser } from './guards/active-user.guard';
import { ActiveUserData } from './types';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  @UseGuards(AuthGuard('local'))
  signIn(@Req() req: { user: User }) {
    return this.authService.generateTokens(req.user);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh-tokens')
  refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @Public()
  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@ActiveUser() user: ActiveUserData) {
    return this.authService.getProfile(user.sub);
  }
}

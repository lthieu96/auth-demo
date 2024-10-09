import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from 'src/users/entities/user.entity';
import { Public } from './guards/public.guard';
import { CurrentUser } from './guards/current-user.guard';
import { CurrentUserData } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  @UseGuards(AuthGuard('local'))
  signIn(@Req() req: { user: User }) {
    return this.authService.generateTokens(req.user);
  }

  @Public()
  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: CurrentUserData) {
    return user;
  }
}

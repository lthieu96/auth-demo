import { Body, Controller, Post } from '@nestjs/common';
import { GoogleService } from './google.service';
import { GoogleTokenDto } from '../dto/google-token.dto';
import { Public } from '../guards/public.guard';

@Public()
@Controller('auth/google')
export class GoogleController {
  constructor(private readonly googleAuthService: GoogleService) {}

  @Post()
  authenticate(@Body() googleTokenDto: GoogleTokenDto) {
    return this.googleAuthService.authenticate(googleTokenDto.token);
  }
}

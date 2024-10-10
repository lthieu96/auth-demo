import { AuthService } from './../auth.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { OAuth2Client } from 'google-auth-library';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GoogleService implements OnModuleInit {
  private oauthClient: OAuth2Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  onModuleInit() {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    this.oauthClient = new OAuth2Client(clientId, clientSecret);
  }

  async authenticate(token: string) {
    try {
      const ticket = await this.oauthClient.verifyIdToken({
        idToken: token,
      });

      const { sub: googleId, email, name } = ticket.getPayload();
      const user = await this.usersRepository.findOneBy({ googleId });
      if (!user) {
        const newUser = await this.usersRepository.save({
          email,
          name,
          googleId,
        });
        return this.authService.generateTokens(newUser);
      }
      return this.authService.generateTokens(user);
    } catch (error) {
      const pgUniqueViolationErrorCode = '23505';
      if (error.code === pgUniqueViolationErrorCode) {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }
}

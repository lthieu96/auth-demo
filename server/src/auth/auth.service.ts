import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from './hashing/hashing.service';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { SignUpDto } from './dto/sign-up.dto';
import { ActiveUserData } from './types';
import { RefreshTokenIdsStorage } from './storage/refresh-token-ids.storage';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    try {
      const user = new User();
      user.name = signUpDto.name;
      user.email = signUpDto.email;
      user.password = await this.hashingService.hash(signUpDto.password);

      await this.usersRepository.save(user);
    } catch (error) {
      const pgUniqueViolationErrorCode = '23505';
      if (error.code === pgUniqueViolationErrorCode) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findOneBy({ email });
    if (!user) {
      return null;
    }
    const isValidPassword = await this.hashingService.compare(
      password,
      user.password,
    );
    if (!isValidPassword) {
      return null;
    }
    return user;
  }

  async generateTokens(user: User) {
    const refreshTokenId = randomUUID();

    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        {
          email: user.email,
          role: user.role,
        },
      ),
      this.signToken<{ refreshTokenId: string }>(
        user.id,
        this.jwtConfiguration.refreshTokenTtl,
        {
          refreshTokenId,
        },
      ),
    ]);
    await this.refreshTokenIdsStorage.insert(user.id, refreshTokenId);
    return { accessToken, refreshToken };
  }

  async signToken<T>(userId: number, expiresIn: string | number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        expiresIn,
        secret: this.jwtConfiguration.secret,
      },
    );
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
      Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }
    >(refreshTokenDto.refreshToken, {
      secret: this.jwtConfiguration.secret,
    });

    const user = await this.usersRepository.findOneByOrFail({ id: sub });
    const isValidToken = await this.refreshTokenIdsStorage.validate(
      user.id,
      refreshTokenId,
    );

    if (!isValidToken) {
      throw new UnauthorizedException('Invalid refresh token');
    } else {
      await this.refreshTokenIdsStorage.inValidate(user.id);
    }
    return this.generateTokens(user);
  }

  async getProfile(userId: number) {
    return await this.usersRepository.findOneBy({ id: userId });
  }
}

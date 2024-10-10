import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RefreshTokenIdsStorage {
  constructor(@InjectRedis() private readonly redisClient: Redis) {}

  async insert(userId: number, tokenId: string): Promise<void> {
    await this.redisClient.set(this.getKey(userId), tokenId);
  }

  async validate(userId: number, tokenId: string): Promise<boolean> {
    return (await this.redisClient.get(this.getKey(userId))) === tokenId;
  }

  async inValidate(userId: number): Promise<void> {
    await this.redisClient.del(this.getKey(userId));
  }

  getKey(userId: number) {
    return `user_${userId}`;
  }
}

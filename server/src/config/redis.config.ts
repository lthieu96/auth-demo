import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  password: process.env.REDIS_PASSWORD,
  host: process.env.REDIS_HOST,
}));

import { createParamDecorator } from '@nestjs/common';
import { CurrentUserData } from '../types';

export const CurrentUser = createParamDecorator(
  (field: keyof CurrentUserData | undefined, ctx) => {
    const user = ctx.switchToHttp().getRequest()?.user;
    return field ? user?.[field] : user;
  },
);

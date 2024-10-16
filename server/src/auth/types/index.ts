import { Role } from 'src/users/enums/role.enum';

export type ActiveUserData = {
  sub: number;
  email: string;
  role: Role;
};

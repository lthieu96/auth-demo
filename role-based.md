## Role based access control

1. Cập nhật User entity:

Cập nhật file src/users/user.entity.ts để thêm trường role:

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

export enum UserRole {
	USER = "user",
	ADMIN = "admin",
}

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	email: string;

	@Column({ nullable: true })
	password: string;

	@Column({ nullable: true })
	googleId: string;

	@Column({
		type: "enum",
		enum: UserRole,
		default: UserRole.USER,
	})
	role: UserRole;
}
```

2. Tạo Role decorator:

Tạo file mới src/auth/roles.decorator.ts:

```typescript
import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../users/user.entity";

export const ROLES_KEY = "roles";
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

3. Tạo RolesGuard:

Tạo file mới src/auth/roles.guard.ts:

```typescript
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "../users/user.entity";
import { ROLES_KEY } from "./roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (!requiredRoles) {
			return true;
		}
		const { user } = context.switchToHttp().getRequest();
		return requiredRoles.some((role) => user.role === role);
	}
}
```

4. Cập nhật Auth module:

Cập nhật file src/auth/auth.module.ts để thêm RolesGuard:

```typescript
import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "./local.strategy";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./jwt.strategy";
import { GoogleStrategy } from "./google.strategy";
import { jwtConstants } from "./constants";
import { RolesGuard } from "./roles.guard";

@Module({
	imports: [
		UsersModule,
		PassportModule,
		JwtModule.register({
			secret: jwtConstants.secret,
			signOptions: { expiresIn: "60m" },
		}),
	],
	providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy, RolesGuard],
	exports: [AuthService],
})
export class AuthModule {}
```

5. Cập nhật JWT Strategy:

Cập nhật file src/auth/jwt.strategy.ts để thêm role vào payload:

```typescript
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { jwtConstants } from "./constants";
import { UsersService } from "../users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private usersService: UsersService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: jwtConstants.secret,
		});
	}

	async validate(payload: any) {
		const user = await this.usersService.findOne(payload.email);
		return { userId: payload.sub, email: payload.email, role: user.role };
	}
}
```

6. Cập nhật Auth service:

Cập nhật file src/auth/auth.service.ts để thêm role vào JWT payload:

```typescript
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
	constructor(private usersService: UsersService, private jwtService: JwtService) {}

	// ... các phương thức hiện có ...

	async login(user: any) {
		const payload = { email: user.email, sub: user.id, role: user.role };
		return {
			access_token: this.jwtService.sign(payload),
		};
	}

	// ... các phương thức khác ...
}
```

7. Sử dụng Roles decorator và RolesGuard:

Bây giờ bạn có thể sử dụng Roles decorator và RolesGuard trong các controller của mình. Ví dụ:

```typescript
import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { UserRole } from "../users/user.entity";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
	@Get()
	@Roles(UserRole.ADMIN)
	getAdminData() {
		return { message: "This is admin data" };
	}
}
```

8. Cập nhật Users service:

Cập nhật file src/users/users.service.ts để thêm phương thức setUserRole:

```typescript
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserRole } from "./user.entity";

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>
	) {}

	// ... các phương thức hiện có ...

	async setUserRole(userId: number, role: UserRole): Promise<User> {
		const user = await this.usersRepository.findOne(userId);
		if (!user) {
			throw new Error("User not found");
		}
		user.role = role;
		return this.usersRepository.save(user);
	}
}
```

9. Tạo một endpoint để set role cho user (chỉ dành cho admin):

Trong AdminController hoặc một controller phù hợp, thêm một endpoint để set role:

```typescript
import { Controller, Post, UseGuards, Body, Param } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { UserRole } from "../users/user.entity";
import { UsersService } from "../users/users.service";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
	constructor(private usersService: UsersService) {}

	@Post("users/:id/role")
	@Roles(UserRole.ADMIN)
	async setUserRole(@Param("id") id: number, @Body("role") role: UserRole) {
		return this.usersService.setUserRole(id, role);
	}
}
```

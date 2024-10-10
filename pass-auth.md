## Email/Pass Auth

1. Thiết lập dự án:

Bước 1.1: Tạo dự án NestJS mới

```bash
nest new nestjs-auth-project
cd nestjs-auth-project
```

Bước 1.2: Cài đặt các dependency cần thiết

```bash
npm install @nestjs/passport passport passport-local @nestjs/jwt passport-jwt bcrypt
npm install @nestjs/typeorm typeorm pg
npm install --save-dev @types/passport-local @types/passport-jwt @types/bcrypt
```

2. Cấu hình cơ sở dữ liệu:

Bước 2.1: Tạo file cấu hình database (src/config/database.config.ts)

```typescript
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const databaseConfig: TypeOrmModuleOptions = {
	type: "postgres",
	host: "localhost",
	port: 5432,
	username: "your_username",
	password: "your_password",
	database: "your_database",
	entities: [__dirname + "/../**/*.entity{.ts,.js}"],
	synchronize: true, // Chỉ sử dụng trong môi trường phát triển
};
```

3. Tạo User module:

Bước 3.1: Tạo User module, entity, và service

```bash
nest g module users
nest g service users
```

Bước 3.2: Tạo User entity (src/users/user.entity.ts)

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	email: string;

	@Column()
	password: string;
}
```

Bước 3.3: Cập nhật Users service (src/users/users.service.ts)

```typescript
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>
	) {}

	async findOne(email: string): Promise<User | undefined> {
		return this.usersRepository.findOne({ where: { email } });
	}

	async create(email: string, hashedPassword: string): Promise<User> {
		const user = new User();
		user.email = email;
		user.password = hashedPassword;
		return this.usersRepository.save(user);
	}
}
```

4. Tạo Auth module:

Bước 4.1: Tạo Auth module và service

```bash
nest g module auth
nest g service auth
```

Bước 4.2: Cập nhật Auth service (src/auth/auth.service.ts)

```typescript
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
	constructor(private usersService: UsersService, private jwtService: JwtService) {}

	async validateUser(email: string, pass: string): Promise<any> {
		const user = await this.usersService.findOne(email);
		if (user && (await bcrypt.compare(pass, user.password))) {
			const { password, ...result } = user;
			return result;
		}
		return null;
	}

	async login(user: any) {
		const payload = { email: user.email, sub: user.id };
		return {
			access_token: this.jwtService.sign(payload),
		};
	}

	async register(email: string, password: string) {
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);
		return this.usersService.create(email, hashedPassword);
	}
}
```

5. Cấu hình Passport strategies:

Bước 5.1: Tạo Local strategy (src/auth/local.strategy.ts)

```typescript
import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private authService: AuthService) {
		super({ usernameField: "email" });
	}

	async validate(email: string, password: string): Promise<any> {
		const user = await this.authService.validateUser(email, password);
		if (!user) {
			throw new UnauthorizedException();
		}
		return user;
	}
}
```

Bước 5.2: Tạo JWT strategy (src/auth/jwt.strategy.ts)

```typescript
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { jwtConstants } from "./constants";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: jwtConstants.secret,
		});
	}

	async validate(payload: any) {
		return { userId: payload.sub, email: payload.email };
	}
}
```

Bước 5.3: Tạo file constants (src/auth/constants.ts)

```typescript
export const jwtConstants = {
	secret: "your_jwt_secret_key", // Trong thực tế, hãy sử dụng biến môi trường
};
```

6. Cập nhật Auth module:

Cập nhật src/auth/auth.module.ts

```typescript
import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { PassportModule } from "@nestjs/passport";
import { LocalStrategy } from "./local.strategy";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./jwt.strategy";
import { jwtConstants } from "./constants";

@Module({
	imports: [
		UsersModule,
		PassportModule,
		JwtModule.register({
			secret: jwtConstants.secret,
			signOptions: { expiresIn: "60m" },
		}),
	],
	providers: [AuthService, LocalStrategy, JwtStrategy],
	exports: [AuthService],
})
export class AuthModule {}
```

7. Tạo Auth controller:

Tạo file src/auth/auth.controller.ts

```typescript
import { Controller, Request, Post, UseGuards, Body } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) {}

	@UseGuards(AuthGuard("local"))
	@Post("login")
	async login(@Request() req) {
		return this.authService.login(req.user);
	}

	@Post("register")
	async register(@Body() body: { email: string; password: string }) {
		return this.authService.register(body.email, body.password);
	}
}
```

8. Cập nhật App module:

Cập nhật src/app.module.ts

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { databaseConfig } from "./config/database.config";

@Module({
	imports: [TypeOrmModule.forRoot(databaseConfig), AuthModule, UsersModule],
})
export class AppModule {}
```

9. Kiểm tra và chạy ứng dụng:

Bước 9.1: Khởi động PostgreSQL và tạo cơ sở dữ liệu

Bước 9.2: Chạy ứng dụng NestJS

```bash
npm run start:dev
```

## Google Auth

1. Cài đặt các dependency cần thiết:

```bash
npm install @nestjs/passport passport passport-google-oauth20
npm install --save-dev @types/passport-google-oauth20
```

2. Tạo Google OAuth credentials:

- Truy cập Google Cloud Console (https://console.cloud.google.com/)
- Tạo một dự án mới hoặc chọn dự án hiện có
- Đi tới "APIs & Services" > "Credentials"
- Tạo "OAuth client ID" mới, chọn "Web application"
- Thêm URI chuyển hướng (ví dụ: http://localhost:3000/auth/google/callback)
- Lưu Client ID và Client Secret

3. Cập nhật User entity:

Cập nhật file src/users/user.entity.ts để thêm trường googleId:

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

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
}
```

4. Cập nhật Users service:

Cập nhật file src/users/users.service.ts để thêm phương thức findOrCreateGoogleUser:

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

	// ... các phương thức hiện có ...

	async findOrCreateGoogleUser(profile: any): Promise<User> {
		const { email, id: googleId } = profile;
		let user = await this.usersRepository.findOne({ where: { email } });

		if (!user) {
			user = new User();
			user.email = email;
			user.googleId = googleId;
			await this.usersRepository.save(user);
		} else if (!user.googleId) {
			user.googleId = googleId;
			await this.usersRepository.save(user);
		}

		return user;
	}
}
```

5. Tạo Google Strategy:

Tạo file mới src/auth/google.strategy.ts:

```typescript
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { Injectable } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
	constructor(private authService: AuthService) {
		super({
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: "http://localhost:3000/auth/google/callback",
			scope: ["email", "profile"],
		});
	}

	async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
		const { emails } = profile;
		const user = await this.authService.validateGoogleUser({
			email: emails[0].value,
			googleId: profile.id,
		});
		done(null, user);
	}
}
```

6. Cập nhật Auth service:

Cập nhật file src/auth/auth.service.ts để thêm phương thức validateGoogleUser:

```typescript
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
	constructor(private usersService: UsersService, private jwtService: JwtService) {}

	// ... các phương thức hiện có ...

	async validateGoogleUser(profile: any) {
		const user = await this.usersService.findOrCreateGoogleUser(profile);
		return this.login(user);
	}
}
```

7. Cập nhật Auth controller:

Cập nhật file src/auth/auth.controller.ts để thêm các route cho xác thực Google:

```typescript
import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) {}

	// ... các route hiện có ...

	@Get("google")
	@UseGuards(AuthGuard("google"))
	async googleAuth(@Req() req) {}

	@Get("google/callback")
	@UseGuards(AuthGuard("google"))
	googleAuthRedirect(@Req() req) {
		return this.authService.validateGoogleUser(req.user);
	}
}
```

8. Cập nhật Auth module:

Cập nhật file src/auth/auth.module.ts để thêm GoogleStrategy:

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

@Module({
	imports: [
		UsersModule,
		PassportModule,
		JwtModule.register({
			secret: jwtConstants.secret,
			signOptions: { expiresIn: "60m" },
		}),
	],
	providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy],
	exports: [AuthService],
})
export class AuthModule {}
```

9. Cấu hình biến môi trường:

Tạo file .env trong thư mục gốc của dự án và thêm các biến sau:

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Đảm bảo bạn đã cài đặt và cấu hình dotenv để sử dụng các biến môi trường này.

10. Cập nhật main.ts:

Cập nhật file src/main.ts để sử dụng dotenv:

```typescript
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as dotenv from "dotenv";

async function bootstrap() {
	dotenv.config();
	const app = await NestFactory.create(AppModule);
	await app.listen(3000);
}
bootstrap();
```

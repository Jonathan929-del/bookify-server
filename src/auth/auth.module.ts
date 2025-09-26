import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, JwtStrategy],
  imports:[
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key', // use env var
      signOptions: { expiresIn: '15m' }, // default expiry for access tokens
    }),
  ]
})
export class AuthModule {}
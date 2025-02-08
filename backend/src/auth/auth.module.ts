import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';  // Import UserModule to use UserService
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserService } from '../user/user.service';

@Module({
  imports: [
    UserModule,  // Import UserModule, which provides UserService
    JwtModule.register({
      secret: 'h4AfbTM,/g*wu%9rYL<X@!RPJ&?;V63(2',  // JWT secret key (consider using env variable for production)
      signOptions: { expiresIn: '24h' },  // Token expiration time (12 hours)
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],  // No need to include UserService here
  controllers: [AuthController],
})
export class AuthModule {}

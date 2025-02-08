import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ExtractJwt } from 'passport-jwt';
import { UserService } from '../user/user.service';  // UserService to access the User data

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),  // Extract JWT from Authorization header
      secretOrKey: 'h4AfbTM,/g*wu%9rYL<X@!RPJ&?;V63(2',  // Hardcoded secret key (you should use environment variables in production)
    });
  }

  // Validate the user based on the payload in the token
  async validate(payload: any) {
    // Payload contains user data like id, email, role, etc.
    const user = await this.userService.findOne(payload.sub);  // Look up the user by ID from the payload
    if (!user) {
      throw new Error('User not found');  // If the user is not found, throw an error
    }
    return user;  // Return the user object to be attached to the request object
  }
}

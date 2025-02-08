import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    // Check if user exists and has a role
    if (!user || !user.role) {
      throw new ForbiddenException('Invalid user credentials');
    }

    // Check if the user's role matches any of the required roles
    return requiredRoles.includes(user.role);
  }
}

import { SetMetadata } from '@nestjs/common';

// Define the @Roles decorator to attach roles metadata
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

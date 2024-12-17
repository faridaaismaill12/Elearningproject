import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly reflector: Reflector, // Used to retrieve metadata for roles
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid token');
        }

        const token = authHeader.split(' ')[1];

        try {
            const payload = this.jwtService.verify(token);
            // console.log('Token payload:', payload); // Debugging
            if (!payload || !payload.id || !payload.role) {
                throw new UnauthorizedException('Invalid token payload');
            }

            request.user = payload; // Attach decoded payload to req.user

            // Retrieve roles required for this route
            const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

            // If no roles are specified, grant access
            if (!requiredRoles || requiredRoles.length === 0) {
                return true;
            }

            // Check if the user's role matches the required roles
            if (!requiredRoles.includes(payload.role)) {
                throw new ForbiddenException('You do not have the required permissions');
            }

            return true;
        } catch (err) {
            if (err instanceof Error) {
                console.error('Token verification failed:', err.message); // Debugging
            } else {
                console.error('Token verification failed:', err); // Debugging
            }
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
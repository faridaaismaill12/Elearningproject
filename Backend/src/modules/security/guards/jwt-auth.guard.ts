import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid token');
        }

        const token = authHeader.split(' ')[1];

        try {
            const payload = this.jwtService.verify(token); // Verify and decode token
            // console.log('Decoded Token Payload:', payload); // Debugging
            if (!payload || !payload.id) {
                throw new UnauthorizedException('Invalid token payload');
            }
            request.user = payload; // Attach decoded payload to req.user
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

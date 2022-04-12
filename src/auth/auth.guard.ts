import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const headers = req.headers;

    const signature = headers['signature'];
    const pubKey = headers['public-key'];
    const poolId = headers['pool-id'];

    if (signature && pubKey && poolId) {
      return await this.authService.validate(signature, pubKey, poolId);
    }

    return false;
  }
}

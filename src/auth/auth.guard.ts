import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class PoolGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const headers = req.headers;
    const poolId = headers['pool-id'];
    const path = req.url;

    if (poolId) {
      return await this.authService.validatePool(poolId, path);
    }

    throw new HttpException('Please include the "pool-id" header.', 403);
  }
}

@Injectable()
export class SignatureGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const headers = req.headers;

    const signature = headers['signature'];
    const pubKey = headers['public-key'];
    const poolId = headers['pool-id'];

    if (signature && pubKey && poolId) {
      return await this.authService.validateSignature(
        signature,
        pubKey,
        poolId,
      );
    }

    throw new HttpException(
      'Please include "signature", "public-key", and "pool-id" headers.',
      403,
    );
  }
}

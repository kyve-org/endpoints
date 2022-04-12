import { Module } from '@nestjs/common';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';
import { AuthService } from '../auth/auth.service';

@Module({
  controllers: [ProxyController],
  exports: [ProxyService],
  providers: [AuthService, ProxyService],
})
export class ProxyModule {}

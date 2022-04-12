import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProxyController } from './proxy/proxy.controller';
import { ProxyModule } from './proxy/proxy.module';

@Module({
  controllers: [ProxyController],
  imports: [AuthModule, ProxyModule],
})
export class AppModule {}

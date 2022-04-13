import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProxyController } from './proxy/proxy.controller';
import { ProxyModule } from './proxy/proxy.module';

@Module({
  controllers: [ProxyController],
  imports: [AuthModule, ConfigModule.forRoot(), ProxyModule],
})
export class AppModule {}

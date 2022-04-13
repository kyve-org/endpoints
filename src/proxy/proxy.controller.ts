import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { BitcoinBody } from './proxy.models';
import { ProxyService } from './proxy.service';
import { PoolGuard, SignatureGuard } from '../auth/auth.guard';

@Controller()
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('bitcoin')
  @UseGuards(PoolGuard, SignatureGuard)
  async bitcoin(@Body() body: BitcoinBody): Promise<any> {
    return this.proxyService.bitcoin(body);
  }

  @Get(['terra/*'])
  @UseGuards(PoolGuard, SignatureGuard)
  async terra(@Param('0') path: string): Promise<any> {
    const endpoint = process.env.TERRA_ENDPOINT;
    if (!endpoint) throw new HttpException('No Terra endpoint specified.', 501);

    return this.proxyService.cosmosSDK(endpoint, path);
  }
}

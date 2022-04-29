import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { PoolGuard, SignatureGuard } from '../auth/auth.guard';

@Controller()
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('bitcoin')
  @UseGuards(PoolGuard, SignatureGuard)
  async bitcoin(@Body() body: any): Promise<any> {
    const endpoint = process.env.BITCOIN_ENDPOINT;
    if (!endpoint)
      throw new HttpException('No Bitcoin endpoint specified.', 501);

    return this.proxyService.request('post', endpoint, body);
  }

  @Get('cosmos/*')
  @UseGuards(PoolGuard, SignatureGuard)
  async cosmos(@Param('0') path: string): Promise<any> {
    const endpoint = process.env.COSMOS_ENDPOINT;
    if (!endpoint)
      throw new HttpException('No Cosmos endpoint specified.', 501);

    return this.proxyService.request('get', `${endpoint}/${path}`);
  }

  @Post('near')
  @UseGuards(PoolGuard, SignatureGuard)
  async near(@Body() body: any): Promise<any> {
    const endpoint = process.env.NEAR_ENDPOINT;
    if (!endpoint) throw new HttpException('No Near endpoint specified.', 501);

    return this.proxyService.request('post', endpoint, body);
  }

  @Get('solana')
  @UseGuards(PoolGuard, SignatureGuard)
  async solana(@Body() body: any): Promise<any> {
    const endpoint = process.env.SOLANA_ENDPOINT;
    if (!endpoint)
      throw new HttpException('No Solana endpoint specified.', 501);

    return this.proxyService.request('post', endpoint, body);
  }

  @Get('terra/*')
  @UseGuards(PoolGuard, SignatureGuard)
  async terra(@Param('0') path: string): Promise<any> {
    const endpoint = process.env.TERRA_ENDPOINT;
    if (!endpoint) throw new HttpException('No Terra endpoint specified.', 501);

    return this.proxyService.request('get', `${endpoint}/${path}`);
  }
}

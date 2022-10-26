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

  @Post('aurora')
  @UseGuards(PoolGuard, SignatureGuard)
  async aurora(@Body() body: any): Promise<any> {
    const endpoint = process.env.AURORA_ENDPOINT;
    if (!endpoint)
      throw new HttpException('No Aurora endpoint specified.', 501);

    return this.proxyService.request('post', endpoint, body);
  }

  @Get('bitcoin')
  // @UseGuards(PoolGuard, SignatureGuard) temp disable for beta
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

  @Get('evmos-cosmos/*')
  @UseGuards(PoolGuard, SignatureGuard)
  async evmosCosmos(@Param('0') path: string): Promise<any> {
    const endpoint = process.env.EVMOS_COSMOS_ENDPOINT;
    if (!endpoint)
      throw new HttpException('No Evmos Cosmos endpoint specified.', 501);

    const token = process.env.EVMOS_COSMOS_TOKEN;
    if (!token)
      throw new HttpException('No Evmos Cosmos auth token specified.', 501);

    return this.proxyService.request(
      'get',
      `${endpoint}/${path}?auth=${token}`,
    );
  }

  @Post('evmos-evm')
  @UseGuards(PoolGuard, SignatureGuard)
  async evmosEVM(@Body() body: any): Promise<any> {
    const endpoint = process.env.EVMOS_EVM_ENDPOINT;
    if (!endpoint)
      throw new HttpException('No Evmos EVM endpoint specified.', 501);

    return this.proxyService.request('post', endpoint, body);
  }

  @Get('kusama/*')
  @UseGuards(PoolGuard, SignatureGuard)
  async kusama(@Param('0') path: string): Promise<any> {
    const endpoint = process.env.KUSAMA_ENDPOINT;
    if (!endpoint)
      throw new HttpException('No Kusama endpoint specified.', 501);

    return this.proxyService.request('get', `${endpoint}/${path}`);
  }

  @Post('near')
  @UseGuards(PoolGuard, SignatureGuard)
  async near(@Body() body: any): Promise<any> {
    const endpoint = process.env.NEAR_ENDPOINT;
    if (!endpoint) throw new HttpException('No Near endpoint specified.', 501);

    return this.proxyService.request('post', endpoint, body);
  }

  @Get('polkadot/*')
  @UseGuards(PoolGuard, SignatureGuard)
  async polkadot(@Param('0') path: string): Promise<any> {
    const endpoint = process.env.POLKADOT_ENDPOINT;
    if (!endpoint)
      throw new HttpException('No Polkadot endpoint specified.', 501);

    return this.proxyService.request('get', `${endpoint}/${path}`);
  }

  @Post('solana')
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

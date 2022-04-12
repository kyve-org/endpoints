import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { BitcoinBody } from './proxy.models';
import { ProxyService } from './proxy.service';
import { AuthGuard } from '../auth/auth.guard';

// TODO: Check that the pool config matches the requested endpoint.

@Controller()
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('bitcoin')
  @UseGuards(AuthGuard)
  async bitcoin(@Body() body: BitcoinBody): Promise<any> {
    return this.proxyService.bitcoin(body);
  }
}

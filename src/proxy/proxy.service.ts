import { Injectable } from '@nestjs/common';
import { BitcoinBody } from './proxy.models';

@Injectable()
export class ProxyService {
  async bitcoin(body: BitcoinBody): Promise<any> {
    return 'coming soon ...';
  }
}

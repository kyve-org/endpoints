import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { BitcoinBody } from './proxy.models';

@Injectable()
export class ProxyService {
  async bitcoin(body: BitcoinBody): Promise<any> {
    return 'coming soon ...';
  }

  async cosmosSDK(endpoint: string, path: string): Promise<any> {
    try {
      const res = await axios.get(`${endpoint}/${path}`);
      return res.data;
    } catch (err) {
      throw new HttpException(err.response.data.message, err.response.status);
    }
  }
}

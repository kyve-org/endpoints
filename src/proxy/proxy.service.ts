import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ProxyService {
  async request(
    method: 'get' | 'post',
    endpoint: string,
    body?: any,
  ): Promise<any> {
    try {
      let res: any;
      if (method === 'get') {
        res = await axios.get(endpoint);
      }

      if (method === 'post') {
        res = await axios.post(endpoint, body);
      }

      return res.data;
    } catch (err) {
      console.log(err);

      if (err.response) {
        throw new HttpException(err.response.data, err.response.status);
      } else {
        throw new Error();
      }
    }
  }
}

import { pubkeyToAddress } from '@cosmjs/amino';
import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { addSeconds, compareAsc } from 'date-fns';
import { Pool } from './auth.models';
import { verifyADR036Signature } from '../utils/adr036';
import SDK, { KyveLCDClientType } from '@kyve/sdk-beta';

export const getPoolConfig = async (configURL: string) => {
  try {
    let url: string;

    // allow ipfs:// or ar:// as external config urls
    if (configURL.startsWith('ipfs://')) {
      url = configURL.replace('ipfs://', 'https://ipfs.io/');
    } else if (configURL.startsWith('ar://')) {
      url = configURL.replace('ar://', 'https://arweave.net/');
    } else {
      throw Error('Unsupported config link protocol');
    }

    const { data } = await axios.get(url);
    return data;
  } catch {
    return {};
  }
};

@Injectable()
export class AuthService {
  private lcd: KyveLCDClientType;
  private pools: { [id: string]: Pool } = {};

  constructor() {
    this.lcd = new SDK(process.env.NETWORK as any).createLCDClient();

    setTimeout(() => this.cachePools(), 10 * 1000);
  }

  private async cachePools() {
    try {
      const { pools } = await this.lcd.kyve.query.v1beta1.pools();

      for (let pool of pools) {
        const config = await getPoolConfig(pool.data?.config ?? '');

        this.pools[pool.id] = {
          config,
          stakers: pool.stakers,
        };
      }
    } catch (err) {
      console.log(err);
    }
  }

  async validatePool(id: string, path: string): Promise<boolean> {
    // Fetch pool configuration.
    const config = this.pools[id].config;

    // check if url is inside the source
    if (config.sources.includes(path)) {
      return true;
    }

    throw new HttpException(
      'Pool is not configured to use this endpoint.',
      403,
    );
  }

  async validateSignature(
    signature: string,
    pubKey: string,
    poolId: string,
    timestamp: string,
  ): Promise<boolean> {
    const lifetime = process.env.LIFETIME ?? '60';
    const prefix = process.env.BECH32_PREFIX ?? 'kyve';

    // Convert public key to Bech32 formatted address.
    const signer = pubkeyToAddress(
      {
        type: 'tendermint/PubKeySecp256k1',
        value: pubKey,
      },
      prefix,
    );

    // Recreate signed message from inputs.
    const message = `${signer}//${poolId}//${timestamp}`;

    // Check that the signature is correct.
    const isValid = await verifyADR036Signature(message, pubKey, signature);

    if (isValid) {
      // Signature is valid.
      const stakers = this.pools[poolId].stakers;

      // Check if the signature is expired.
      const now = new Date();
      const expiry = addSeconds(parseInt(timestamp), parseInt(lifetime));

      if (compareAsc(now, expiry) === 1) {
        throw new HttpException('Signature is expired.', 403);
      }

      // Check if the signer is an active protocol node.
      if (stakers.includes(signer)) {
        return true;
      } else {
        throw new HttpException('Signer is not an active protocol node.', 403);
      }
    } else {
      // Signature is invalid.
      throw new HttpException('Signature is invalid.', 403);
    }
  }
}

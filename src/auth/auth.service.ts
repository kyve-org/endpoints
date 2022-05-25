import { pubkeyToAddress } from '@cosmjs/amino';
import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { addSeconds, compareAsc } from 'date-fns';
import { Config, Pool, PoolsResponse } from './auth.models';
import { verifyADR036Signature } from '../utils/adr036';

const endpoint = process.env.ENDPOINT ?? 'https://api.korellia.kyve.network';
const lifetime = process.env.LIFETIME ?? '60';
const prefix = process.env.BECH32_PREFIX ?? 'kyve';
const url = process.env.URL ?? 'https://proxy.kyve.network';

@Injectable()
export class AuthService {
  private pools: { [id: string]: Pool } = {};

  constructor() {
    // noinspection JSIgnoredPromiseFromCall
    this.cachePools();
  }

  private async cachePools() {
    const { data } = await axios.get<PoolsResponse>(
      `${endpoint}/kyve/registry/v1beta1/pools`,
    );

    data.pools.forEach((pool) => {
      const config: Config = JSON.parse(pool.config);

      this.pools[pool.id] = {
        config,
        stakers: pool.stakers,
      };
    });

    console.log('cached ...');

    // Run every 10 seconds.
    setTimeout(this.cachePools, 10 * 1000);
  }

  async validatePool(id: string, path: string): Promise<boolean> {
    // Fetch pool configuration.
    const config = this.pools[id].config;

    // Check RPC endpoint specified in pool configuration.
    if (`${url}${path}`.startsWith(config.rpc)) {
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

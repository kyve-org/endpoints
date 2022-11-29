import { pubkeyToAddress } from '@cosmjs/amino';
import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { addSeconds, compareAsc } from 'date-fns';
import { verifyADR036Signature } from '../utils/adr036';
import SDK, { KyveLCDClientType } from '@kyve/sdk-beta';

require('dotenv').config();

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
  private pools: any = {};

  constructor() {
    setTimeout(async function () {
      try {
        const lcd = new SDK(process.env.NETWORK as any).createLCDClient();
        this.pools = {};

        const { stakers } = await lcd.kyve.query.v1beta1.stakers({
          search: '',
          status: 1,
        });

        for (let staker of stakers) {
          for (let pool of staker.pools) {
            const poolId = pool.pool?.id ?? '';

            if (this.pools[poolId]) {
              this.pools[poolId].push(pool.valaddress);
            } else {
              this.pools[poolId] = [pool.valaddress];
            }
          }
        }
      } catch (err) {
        console.log(err);
      }
    }, 10 * 1000);
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
      const valaccounts = this.pools[poolId] || [];

      // Check if the signature is expired.
      const now = new Date();
      const expiry = addSeconds(parseInt(timestamp), parseInt(lifetime));

      if (compareAsc(now, expiry) === 1) {
        throw new HttpException('Signature is expired.', 403);
      }

      // Check if the signer is an active protocol node.
      if (valaccounts.includes(signer)) {
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

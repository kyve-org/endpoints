import { pubkeyToAddress } from '@cosmjs/amino';
import { verifyADR36Amino } from '@keplr-wallet/cosmos';
import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { Config, PoolResponse } from './auth.models';

@Injectable()
export class AuthService {
  async validatePool(id: string, path: string): Promise<boolean> {
    const url = process.env.URL ?? 'https://proxy.kyve.network';
    const endpoint =
      process.env.ENDPOINT ?? 'https://api.korellia.kyve.network';

    // Fetch pool configuration.
    const { data } = await axios.get<PoolResponse>(
      `${endpoint}/kyve/registry/v1beta1/pool/${id}`,
    );
    const config: Config = JSON.parse(data.pool.config);

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
  ): Promise<boolean> {
    const prefix = process.env.BECH32_PREFIX ?? 'kyve';
    const endpoint =
      process.env.ENDPOINT ?? 'https://api.korellia.kyve.network';

    // TODO: Improve message formatting.
    const message = `${poolId}`;

    // Convert public key to Bech32 formatted address.
    const signer = pubkeyToAddress(
      {
        type: 'tendermint/PubKeySecp256k1',
        value: pubKey,
      },
      prefix,
    );

    // Check that the signature is correct.
    const isValid = verifyADR36Amino(
      prefix,
      signer,
      message,
      Buffer.from(pubKey),
      Buffer.from(signature),
    );

    if (isValid) {
      // Signature is valid.
      const { data } = await axios.get<PoolResponse>(
        `${endpoint}/kyve/registry/v1beta1/pool/${poolId}`,
      );

      // Check if the signer is an active protocol node.
      if (data.pool.stakers.includes(signer)) {
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

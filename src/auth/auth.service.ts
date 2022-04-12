import { pubkeyToAddress } from '@cosmjs/amino';
import { verifyADR36Amino } from '@keplr-wallet/cosmos';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PoolResponse } from './auth.models';

@Injectable()
export class AuthService {
  async validate(
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

    // Signature is valid, check if the signer is an active protocol node.
    if (isValid) {
      const { data } = await axios.get<PoolResponse>(
        `${endpoint}/kyve/registry/v1beta/pool/${poolId}`,
      );

      if (data.pool.stakers.includes(signer)) {
        return true;
      }
    }

    return false;
  }
}

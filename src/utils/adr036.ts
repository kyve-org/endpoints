import {
  makeSignDoc,
  pubkeyToAddress,
  serializeSignDoc,
  StdSignDoc,
} from '@cosmjs/amino';
import { Secp256k1, Secp256k1Signature, sha256 } from '@cosmjs/crypto';
import { fromBase64, toAscii, toBase64 } from '@cosmjs/encoding';

const prefix = process.env.BECH32_PREFIX ?? 'kyve';

function makeADR036AminoSignDoc(message: string, pubKey: string): StdSignDoc {
  const signer = pubkeyToAddress(
    {
      type: 'tendermint/PubKeySecp256k1',
      value: pubKey,
    },
    prefix,
  );

  return makeSignDoc(
    [
      {
        type: 'sign/MsgSignData',
        value: {
          signer,
          data: toBase64(toAscii(message)),
        },
      },
    ],
    {
      gas: '0',
      amount: [],
    },
    '',
    '',
    0,
    0,
  );
}

export async function verifyADR036Signature(
  message: string,
  pubKey: string,
  signature: string,
): Promise<boolean> {
  const signBytes = serializeSignDoc(makeADR036AminoSignDoc(message, pubKey));
  const messageHash = sha256(signBytes);

  const parsedSignature = Secp256k1Signature.fromFixedLength(
    fromBase64(signature),
  );
  const parsedPubKey = fromBase64(pubKey);

  return await Secp256k1.verifySignature(
    parsedSignature,
    messageHash,
    parsedPubKey,
  );
}

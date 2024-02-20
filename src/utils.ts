import { Buffer } from "buffer"
import { ethers } from "ethers"
import { Message, crypto } from 'bitcore-lib'
import { toChecksumAddress, bufferToHex, publicToAddress } from "ethereumjs-util"

globalThis.Buffer = Buffer

function toBeHex(data: Buffer) : string {
    return ethers.toBeHex(BigInt('0x' + data.toString('hex')), 32)
}

export function compressedPublicKeyToAddress(compressedPublicKey:string) : string {
    const publicKeyBuffer = Buffer.from(compressedPublicKey, 'hex')
    const addressBuffer = publicToAddress(publicKeyBuffer, true)

    const addressHex = bufferToHex(addressBuffer)

    const ethAddress = toChecksumAddress(addressHex)

    return ethAddress
}

export function convertToEthSignature(bitSignature: string) : string{
    const s = crypto.Signature.fromCompact(Buffer.from(bitSignature, 'base64'))
      // convert to eth signature
      const convertedSign = ethers.Signature.from({
        r: toBeHex(s.r.toBuffer()),
        s: toBeHex(s.s.toBuffer()),
        v: (s.i ? 0x1c: 0x1b)
      })
      return convertedSign.serialized
}

export function verifyBitSignatureWithEthAddress(bitSignature: string, message: string, ethAddress: string) : boolean{
    const digest = '0x' + (new Message(message)).magicHash().toString('hex')
    const ethSignature = convertToEthSignature(bitSignature)
    return ethers.recoverAddress(digest, ethSignature) === ethAddress
}
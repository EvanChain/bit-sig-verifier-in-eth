import { Buffer } from "buffer"
import { ethers } from "ethers"
globalThis.Buffer = Buffer

export function magicHash(data: string): string{
    const dataBytes = ethers.toUtf8Bytes(data)
    const bit_message = ethers.concat([
        ethers.toUtf8Bytes('\x18Bitcoin Signed Message:\n'),
        ethers.toBeArray(dataBytes.length),
        ethers.toUtf8Bytes(data),
    ])
    return ethers.sha256(ethers.sha256(bit_message))
}

function toBeHex(data: Buffer): string {
    return ethers.toBeHex(BigInt('0x' + data.toString('hex')), 32)
}


export function convertToEthSignature(bitSignature: string): string {

    const buf = Buffer.from(bitSignature, 'base64');

    return toEthSignature(buf)
}

export function toEthSignature(buf: Buffer): string {
    var i = buf.slice(0, 1)[0] - 27 - 4;
    if (i < 0) {
        i = i + 4;
    }
    var r = buf.slice(1, 33);
    var s = buf.slice(33, 65);
    if(i !== 0 && i !== 1 && i !== 2 && i !== 3){
        throw new Error('i must be 0, 1, 2, or 3')
    }
    if(r.length !== 32 || s.length !== 32){
        throw new Error('r and s must be 32 bytes')
    }
    const convertedSign = ethers.Signature.from({
        r: toBeHex(r),
        s: toBeHex(s),
        v: (i ? 0x1c : 0x1b)
    })
    return convertedSign.serialized
}


export function recover(bitSignature: string, message: string): string {
    const digest = magicHash(message)
    const ethSignature = convertToEthSignature(bitSignature)
    return ethers.recoverAddress(digest, ethSignature)
}
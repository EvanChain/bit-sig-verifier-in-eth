# [BitSigVerifierInEth](https://github.com/EvanChain/bit-sig-verifier-in-eth)
Verifying native bit message signature in evm.

## notes
Both the ethereum and the bitcoin are base the spec256k1 curve, that means the signature signed by bitcoin wallet can be verified in smart contracts. 
The format of address and signature are different in bitcoin and ethereum, but they have same private key and publick key. You can convert them by this peoject.

## test
```shell
yarn
yarn hardhat test
```

## install
``` shell
yarn add --dev bit-sig-verifier-in-eth
```

## usage
``` typescript
import { convertToEthSignature, compressedPublicKeyToAddress, verifyBitSignatureWithEthAddress } from 'bit-sig-verifier-in-eth'

async function () {
    //generate random signer
    const ethwallet = ethers.Wallet.createRandom()
    const bitkey = new PrivateKey(ethwallet.privateKey.substring(2))
        
    const address = compressedPublicKeyToAddress(bitkey.toPublicKey().toBuffer().toString('hex'))
    expect(address).to.equal(await ethwallet.getAddress())
}

```


[LEARN MORE](https://bsaa.gitbook.io/bsaa-wallet/)

import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs"
import { expect } from "chai"
import { ethers } from "hardhat"
import { Message, PrivateKey, crypto } from 'bitcore-lib'
import * as elliptic from 'elliptic'

describe("BitMessage", function () {

  async function deployOneYearLockFixture() {

    const BitMessage = await ethers.getContractFactory("BitMessage")
    const bitmessage = await BitMessage.deploy()

    const [signer] = await ethers.getSigners()
    
    //generate random bit signer
    const curve = new elliptic.ec('secp256k1')

    const secret = curve.genKeyPair().getPrivate().toString('hex')

    const bitkey = new PrivateKey(secret)
    
    const ethwallet = new ethers.Wallet(secret)

    return { bitmessage, signer, bitkey, ethwallet }
  }

  function toBeHex(data: Buffer) : string {
    return ethers.toBeHex(BigInt('0x' + data.toString('hex')), 32)
  }

  describe("Message Digest", function () {
    it("Should return the right bit message digest", async function () {
      const { bitmessage } = await loadFixture(deployOneYearLockFixture)
      const message = 'Hello, World!'
      const ethDigest = ethers.hashMessage(message)
      console.log("ethDigest:", ethDigest)
      const bitDigest = (new Message(ethDigest.substring(2))).magicHash().toString('hex')
      console.log("bitDigest:", bitDigest)

      const digest = await bitmessage.messageDigest(ethDigest)
      console.log('digest:', digest)
      expect(digest.substring(2)).to.equal(bitDigest)
    })

  })

  describe("Verify Signature", function () {
    it("Should return the right signer address", async function () {
      const { bitmessage, signer, bitkey, ethwallet } = await loadFixture(deployOneYearLockFixture)
      const message = 'Hello, World!'
      const ethDigest = ethers.hashMessage(message)
      const bit_message = new Message(ethDigest.substring(2))

      const signature = bit_message.sign(bitkey)
      console.log('bit signature:', signature)

      const s = crypto.Signature.fromCompact(Buffer.from(signature, 'base64'))
      // convert to eth signature
      const convertedSign = ethers.Signature.from({
        r: toBeHex(s.r.toBuffer()),
        s: toBeHex(s.s.toBuffer()),
        v: (s.i ? 0x1c: 0x1b)
      })
      console.log('eth signature:', convertedSign.serialized)
      console.log('signer address:',await ethwallet.getAddress())
      const recoveredAddress = await bitmessage.recover(ethDigest, convertedSign.serialized)
      console.log('recovered address:', recoveredAddress)
      expect(recoveredAddress).to.equal(await ethwallet.getAddress())
    })

  })

})

import { convertToEthSignature, recover, magicHash } from '../src/utils'
import { ethers } from "hardhat"
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai"
import { Message, PrivateKey, crypto } from 'bitcore-lib'

describe("BitMessage", function () {

  async function deploy() {

    const BitMessage = await ethers.getContractFactory("BitMessage")
    const bitmessage = await BitMessage.deploy()

    const [signer] = await ethers.getSigners()

    //generate random signer
    const ethwallet = ethers.Wallet.createRandom()

    const bitkey = new PrivateKey(ethwallet.privateKey.substring(2))

    return { bitmessage, signer, bitkey, ethwallet }
  }


  describe("Message Digest", function () {
    it("Should return the right bit message digest", async function () {
      const { bitmessage } = await loadFixture(deploy)
      const message = 'Hello, World!'
      const ethDigest = ethers.hashMessage(message)
      console.log("ethDigest:", ethDigest)
      const bitDigest = (new Message(ethDigest.substring(2))).magicHash().toString('hex')
      console.log("bitDigest:", bitDigest)

      const hash = magicHash(ethDigest.substring(2))
      console.log("magicDigest:", hash)

      const digest = await bitmessage.messageDigest(ethDigest)
      console.log('digest:', digest)
      expect(digest.substring(2)).to.equal(bitDigest).to.equals(hash.substring(2))
    })

  })

  describe("Verify Signature", function () {
    it("Should return the right signer address", async function () {
      const { bitmessage, signer, bitkey, ethwallet } = await loadFixture(deploy)
      const message = 'Hello, World!'
      const ethDigest = ethers.hashMessage(message)
      const bit_message = new Message(ethDigest.substring(2))

      const signature = bit_message.sign(bitkey)
      console.log('bit signature:', signature)

      const ethSignature = convertToEthSignature(signature)
      console.log('eth signature:', ethSignature)

      // console.log('eth address:', address)
      console.log('signer address:', await ethwallet.getAddress())
      const recoveredAddress = await bitmessage.recover(ethDigest, ethSignature, true)
      console.log('recovered address:', recoveredAddress)
      expect(recoveredAddress).to.equal(await ethwallet.getAddress())

      expect(recover(signature, ethDigest.substring(2))).to.equals(await ethwallet.getAddress())
    })

  })

})


import { convertToEthSignature, compressedPublicKeyToAddress, verifyBitSignatureWithEthAddress } from '../src/utils'
import { ethers } from "hardhat"
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai"
import { Message, PrivateKey } from 'bitcore-lib'

describe("BitMessage", function () {

    async function deployOneYearLockFixture() {
  
      const BitMessage = await ethers.getContractFactory("BitMessage")
      const bitmessage = await BitMessage.deploy()
  
      const [signer] = await ethers.getSigners()
      
      //generate random signer
      const ethwallet = ethers.Wallet.createRandom()
  
      const bitkey = new PrivateKey(ethwallet.privateKey.substring(2))
  
      return { bitmessage, signer, bitkey, ethwallet }
    }
  
    describe("Convert Address", function(){
      it("Should convert public key to right address", async function () {
        const {bitkey, ethwallet } = await loadFixture(deployOneYearLockFixture)
        const address = compressedPublicKeyToAddress(bitkey.toPublicKey().toBuffer().toString('hex'))
        expect(address).to.equal(await ethwallet.getAddress())
      })
    })
  
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
  
        const ethSignature = convertToEthSignature(signature)
        console.log('eth signature:', ethSignature)
  
        // console.log('eth address:', address)
        console.log('signer address:',await ethwallet.getAddress())
        const recoveredAddress = await bitmessage.recover(ethDigest, ethSignature)
        console.log('recovered address:', recoveredAddress)
        expect(recoveredAddress).to.equal(await ethwallet.getAddress())
  
        expect(verifyBitSignatureWithEthAddress( signature, ethDigest.substring(2), await ethwallet.getAddress()))
      })
  
    })
  
  })
  

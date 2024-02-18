import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs"
import { expect } from "chai"
import { ethers } from "hardhat"

describe("BitMessage", function () {

  async function deployOneYearLockFixture() {

    const BitMessage = await ethers.getContractFactory("BitMessage")
    const bitmessage = await BitMessage.deploy()

    return { bitmessage }
  }

  describe("Message Digest", function () {
    it("Should return the right bit message digest", async function () {
      const { bitmessage } = await loadFixture(deployOneYearLockFixture)
      const digest = await bitmessage.messageDigest("0xc8ee0d506e864589b799a645ddb88b08f5d39e8049f9f702b3b61fa15e55fc73")
      console.log('digest:', digest)
      expect(digest).to.equal("0x65e18fc52d1c8f18497e118c8db284fbbbb906c528eb271be9cf572826fdfdcc")
    })

  })

})

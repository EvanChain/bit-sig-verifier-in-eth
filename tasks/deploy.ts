import { ZeroAddress } from "ethers";
import { task, types } from "hardhat/config"

task("deploy", "Deploy contracts")
    .addOptionalParam("logs", "Print the logs", true, types.boolean)
    .setAction(async ({logs}, 
        { ethers, run }) => {
            
        return {}
    });
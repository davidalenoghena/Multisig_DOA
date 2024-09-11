//Script for deploying the Multisig_DOA.sol

import { ethers } from "hardhat";
async function main() {
    const [deployer] = await ethers.getSigners();

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    const tokenAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

    const Multisig_DOAfac = await ethers.getContractFactory("Multisig_DOA");
    await Multisig_DOAfac.deploy(3, ["0x5B38Da6a701c568545dCfcB03FcB875f56beddC4", "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2", "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db"], "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
}
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });

// ContractAddress: 0x684695e18E5170F7F57dCd23b61fdC6acD30739b
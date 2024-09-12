import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
//import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

describe("MultisigFactory_Test", function () {
    async function deployToken() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await hre.ethers.getSigners();

        const W3_DOAToken = await hre.ethers.getContractFactory("W3_DOA");
        const token = await W3_DOAToken.deploy();

        return { token };
    }
    async function deployMultisigFactory() {
        const { token } = await loadFixture(deployToken);
        const [owner, otherAccount, Acc2, Acc3] = await hre.ethers.getSigners();

        const Multisigfac = await hre.ethers.getContractFactory("MultisigFactory");
        const MultisigfacDeploy = await Multisigfac.deploy();

        return { MultisigfacDeploy, owner, otherAccount, Acc2, Acc3, token };
    }
    describe("CreateMultisigWallet", function () {
        it("Should check if Multisig Wallet is created", async function () {
            const { MultisigfacDeploy, owner, otherAccount, Acc2, Acc3, token } = await loadFixture(deployMultisigFactory);
            let Contdd = await MultisigfacDeploy.createMultisigWallet(2, [Acc2, Acc3], token);
            let arrayClones = await MultisigfacDeploy.getMultiSigClones();

            console.log(Contdd);

            expect(arrayClones.length).to.equal(1);
            //expect(arrayClones[0]).to.equal(Contdd);
            //expect(await MultisigfacDeploy.getMultiSigClones()).to.equal(owner);
        });
    });
});
import {
    time,
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
//import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { expect } from "chai";
import hre, { ethers } from "hardhat";

const quorum = 2;

describe("Multisig_DOA_Test", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployToken() {
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount] = await hre.ethers.getSigners();

        const W3_DOAToken = await hre.ethers.getContractFactory("W3_DOA");
        const token = await W3_DOAToken.deploy();

        return { token };
    }
    async function deployMultisig_DOA() {
        const { token } = await loadFixture(deployToken);
        // Contracts are deployed using the first signer/account by default
        const [owner, otherAccount, Acc2, Acc3] = await hre.ethers.getSigners();

        const Multisig_DOAfac = await hre.ethers.getContractFactory("Multisig_DOA");
        //const Multisig_DOADeploy = await Multisig_DOAfac.deploy(3, ["0x5B38Da6a701c568545dCfcB03FcB875f56beddC4", "0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2", "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db"], token);
        const Multisig_DOADeploy = await Multisig_DOAfac.deploy(quorum, [otherAccount, Acc2, Acc3], token);

        return { Multisig_DOADeploy, owner, otherAccount, Acc2, Acc3, token };
    }
    describe("Deployment", function () {
        it("Should check if owner is correct", async function () {
            const { Multisig_DOADeploy, owner } = await loadFixture(deployMultisig_DOA);

            expect(await Multisig_DOADeploy.owner()).to.equal(owner);
        });

        it("Should check if the quorum is greater than 1", async function () {
            const { Multisig_DOADeploy, owner } = await loadFixture(deployMultisig_DOA);

            expect(await Multisig_DOADeploy.quorum()).to.be.gt(1);
        });
        it("Should check if the validsigners is greater than 1", async function () {
            const { Multisig_DOADeploy, owner } = await loadFixture(deployMultisig_DOA);

            expect(await Multisig_DOADeploy.noOfValidSigners()).to.be.gt(1);
        });
    });
    describe("Transfer", function () {
        it("Should successfully create the transaction", async function () {
            const { Multisig_DOADeploy, owner, otherAccount, Acc2, Acc3, token } = await loadFixture(deployMultisig_DOA);

            const trfAmount = ethers.parseUnits("100", 18);
            await token.transfer(Multisig_DOADeploy, trfAmount); //transfer into the contract
            const originalBalance = await Multisig_DOADeploy.getContractBalance();

            expect(originalBalance).to.equal(trfAmount);

            const amount = ethers.parseUnits("10", 18);

            await Multisig_DOADeploy.transfer(amount, otherAccount, token); //id=1
            expect(await Multisig_DOADeploy.txCount()).to.equal(1);
            
            let trx = await Multisig_DOADeploy.getTransaction(1);
            expect(await trx.id).to.equal(1);
            expect(await trx.amount).to.equal(amount);
            expect(await trx.recipient).to.equal(otherAccount);
            expect(await trx.sender).to.equal(owner);
            expect(await trx.noOfApproval).to.equal(1);
            expect(await trx.transactionSigners.length).to.equal(1);
            expect(await Multisig_DOADeploy.hasItSigned(owner, 1)).to.equal(true);
            expect(await Multisig_DOADeploy.hasItSigned(otherAccount, 1)).to.equal(false);
        });
    });
    describe("Approve", function () {
        it("Should successfully approve the amount", async function () {
            const { Multisig_DOADeploy, owner, otherAccount, Acc2, Acc3, token } = await loadFixture(deployMultisig_DOA);

            const trfAmount = ethers.parseUnits("100", 18);
            await token.transfer(Multisig_DOADeploy, trfAmount); //transfer into the contract
            const originalBalance = await Multisig_DOADeploy.getContractBalance();

            expect(originalBalance).to.equal(trfAmount);

            const amount = ethers.parseUnits("10", 18);

            await Multisig_DOADeploy.transfer(amount, otherAccount, token); //id=1
            
            expect(await Multisig_DOADeploy.txCount()).to.equal(1);

            await Multisig_DOADeploy.connect(Acc2).approveTx(1);

            expect(await token.balanceOf(otherAccount)).to.equal(amount);
            expect(await Multisig_DOADeploy.getContractBalance()).to.equal(originalBalance - amount);
        });
    });
    describe("Update Quorum", function () {
        it("Should successfully update the quorum", async function () {
            const { Multisig_DOADeploy, owner, otherAccount, Acc2, Acc3, token } = await loadFixture(deployMultisig_DOA);

            const oldQuorum = quorum;
            const newQuorum = 3;
            expect(await Multisig_DOADeploy.quorum()).to.equal(oldQuorum);

            await Multisig_DOADeploy.updateQuorum(newQuorum);

            await Multisig_DOADeploy.connect(Acc2).approveQuorum(1);

            expect(await Multisig_DOADeploy.quorum()).to.equal(newQuorum);
        });
    });
});
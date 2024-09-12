// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Multisig_DOA.sol";

contract MultisigFactory {

    Multisig_DOA[] multisigClones;

    function createMultisigWallet(uint256 _quorum, address[] memory _validSigners, address _tokenAddress) external returns (Multisig_DOA newMulsig_, uint256 length_) {

        newMulsig_ = new Multisig_DOA(_quorum, _validSigners, _tokenAddress);

        multisigClones.push(newMulsig_);

        length_ = multisigClones.length;
    }

    function getMultiSigClones() external view returns(Multisig_DOA[] memory) {
        return multisigClones;
    }
}
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Multisig_DOA {
    uint256 public quorum;
    uint8 public noOfValidSigners;
    uint256 public txCount;

    uint256 public updateQCount;

    address public owner;
    address public token_Address;

    //uint8 updateQuorumSigners; //number of signers that have signed for the new quorum
    //address[] list_updateQuorumSigners; //array to track the list of signers to update the quorum

    struct Transaction {
        uint256 id;
        uint256 amount;
        address sender;
        address recipient;
        bool isCompleted;
        uint256 timestamp;
        uint256 noOfApproval;
        address tokenAddress;
        address[] transactionSigners;
    }

    struct UpdateQuorum {
        uint256 newQuorum;
        uint8 noOfQSigners; //number of signers that have signed for the new quorum
        address[] listOfQSigners; //array to track the list of signers to update the quorum 
    }

    mapping(uint => UpdateQuorum) updateQuorums;
    mapping(address => bool) isValidSigner;
    mapping(uint => Transaction) transactions; // txId -> Transaction
    // signer -> transactionId -> bool (checking if an address has signed)
    mapping(address => mapping(uint256 => bool)) hasSigned;

    constructor(uint8 _quorum, address[] memory _validSigners, address _tokenAddress) {
        owner = msg.sender;
        token_Address = _tokenAddress;

        require(_validSigners.length > 1, "few valid signers");
        require(_quorum > 1, "quorum is too small");


        for(uint256 i = 0; i < _validSigners.length; i++) {
            require(_validSigners[i] != address(0), "zero address not allowed");
            require(!isValidSigner[_validSigners[i]], "signer already exist");

            isValidSigner[_validSigners[i]] = true;
        }

        noOfValidSigners = uint8(_validSigners.length);

        if (!isValidSigner[msg.sender]){
            isValidSigner[msg.sender] = true;
            noOfValidSigners += 1;
        }

        require(_quorum <= noOfValidSigners, "quorum greater than valid signers");
        quorum = _quorum;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    function transfer(uint256 _amount, address _recipient, address _tokenAddress) external {
        require(msg.sender != address(0), "address zero found");
        require(isValidSigner[msg.sender], "invalid signer");

        require(_amount > 0, "can't send zero amount");
        require(_recipient != address(0), "address zero found");
        require(_tokenAddress != address(0), "address zero found");

        require(IERC20(_tokenAddress).balanceOf(address(this)) >= _amount, "insufficient funds");

        uint256 _txId = txCount + 1;
        Transaction storage trx = transactions[_txId];
        
        trx.id = _txId;
        trx.amount = _amount;
        trx.recipient = _recipient;
        trx.sender = msg.sender;
        trx.timestamp = block.timestamp;
        trx.tokenAddress = _tokenAddress;
        trx.noOfApproval += 1;
        trx.transactionSigners.push(msg.sender);
        hasSigned[msg.sender][_txId] = true;

        txCount += 1;
    }

    function approveTx(uint256 _txId) external {
        Transaction storage trx = transactions[_txId];

        require(trx.id != 0, "invalid tx id");
        
        require(IERC20(trx.tokenAddress).balanceOf(address(this)) >= trx.amount, "insufficient funds");
        require(!trx.isCompleted, "transaction already completed");
        require(trx.noOfApproval < quorum, "approvals already reached");

        // for(uint256 i = 0; i < trx.transactionSigners.length; i++) {
        //     if(trx.transactionSigners[i] == msg.sender) {
        //         revert("can't sign twice");
        //     }
        // }

        require(isValidSigner[msg.sender], "not a valid signer");
        require(!hasSigned[msg.sender][_txId], "can't sign twice");

        hasSigned[msg.sender][_txId] = true;
        trx.noOfApproval += 1;
        trx.transactionSigners.push(msg.sender);

        if(trx.noOfApproval == quorum) {
            trx.isCompleted = true;
            IERC20(trx.tokenAddress).transfer(trx.recipient, trx.amount);
        }
    }

    function updateQuorum (uint8 _newQuorum) external {
        require(isValidSigner[msg.sender], "not a valid signer");
        require(msg.sender != address(0), "address zero found");
        require(_newQuorum > 1, "must be greater than 1");
        require(quorum != _newQuorum, "cannot be the same");

        updateQCount++;
        UpdateQuorum storage UpdateQ = updateQuorums[updateQCount];
        
        require(!hasSigned[msg.sender][updateQCount], "can't sign twice");

        hasSigned[msg.sender][updateQCount] = true;
        UpdateQ.noOfQSigners += 1;
        UpdateQ.listOfQSigners.push(msg.sender);
        UpdateQ.newQuorum = _newQuorum;
    }

    function approveQuorum(uint256 _QId) external {
        UpdateQuorum storage UpdateQ = updateQuorums[_QId];
        
        require(!hasSigned[msg.sender][updateQCount], "can't sign twice");

        hasSigned[msg.sender][_QId] = true;
        UpdateQ.noOfQSigners += 1;
        UpdateQ.listOfQSigners.push(msg.sender);
        
        if(UpdateQ.noOfQSigners == quorum) {
            quorum = UpdateQ.newQuorum;
        }
    }

    function getContractBalance() external view onlyOwner returns(uint256) {
        return IERC20(token_Address).balanceOf(address(this));
    }

    function getTransaction(uint256 _txId) external view onlyOwner returns(Transaction memory) {
        Transaction storage trx = transactions[_txId];
        return trx;
    }

    function hasItSigned(address _caller, uint256 _txId) external view returns (bool) {
        return hasSigned[_caller][_txId];
    }

    function getQuorumTx(uint256 _QId) external view returns(UpdateQuorum memory) {
        UpdateQuorum storage quorum_d = updateQuorums[_QId];
        return quorum_d;
    }
}
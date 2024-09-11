// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract W3_DOA is ERC20("W3_DOA Token", "W3DOA") {
    address public owner;

    constructor() {
        owner = msg.sender;
        _mint(msg.sender, 100000e18);
    }

    function mint(uint _amount) external {
        require(msg.sender == owner, "stop, you're not the owner'");
        _mint(msg.sender, _amount * 1e18);
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "hardhat/console.sol";

contract Airdrop is ERC20("Airdrop", "ADT") {
    bytes32 immutable public root;
    uint immutable public rewardedAmount;
    mapping(address => bool) public claimed;

    constructor(bytes32 _root, uint _rewardedAmount) {
        root = _root;
        rewardedAmount = _rewardedAmount;
    }

    // function people will call for airdrop
    function claim(bytes32[] calldata _proof) external {
        require(!claimed[msg.sender], "Already claimed airdrop");
        claimed[msg.sender] = true;

        bytes32 _leaf = keccak256(abi.encodePacked(msg.sender));
        require(MerkleProof.verify(_proof, root, _leaf), "Invalid Merkle proof");
        
        _mint(msg.sender, rewardedAmount);
    }
}
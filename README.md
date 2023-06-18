# Basic Information 
This is a Airdrop project created using Merkle Tree.

Airdrop involves the crypto projects sending free tokens to their communities to encourage early adoption.
Tokens are sent directly to the user wallets without any purchase

Merkle Tree store the information in hashes in binary tree so we can access that information quickly. 
Merkle Proof checks/proves if that address/transaction belong to the tree or not without revealing all the data that make up to merkle tree.

We have used openzeppelin library that has special cryptography contracts which let us use the Merkle Proof. 

## Quick start
Clone the repository and install all the packages

``` git clone https://github.com/vrajparikh01/Airdrop-Merkle-Tree ```

``` npm install ```

## Deployment
To deploy all the contracts , run the following command

``` npx hardhat run scripts/deploy.js ```

## Tests
To test the conttracts and see if the user is eligible for airdrop or not

``` npx hardhat test test/test.js ```


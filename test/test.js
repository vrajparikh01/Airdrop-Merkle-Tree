const { expect } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");
const { arrayify } = ethers.utils;

const toWei = (value) => ethers.utils.parseEther(value.toString());
const fromWei = (value) => ethers.utils.formatEther(value);

describe("Merkle Tree", () => {
  const TOTAL_TOKENS = toWei(1000000000);
  const REWARD_AMOUNT = toWei(1000);
  let addrs;
  let contractBlockNumber;
  //   any account that has used ethSwap before blockCutoff will be eligible for the airdrop
  let blockCutoff = 10;

  beforeEach(async () => {
    // Create an array that shuffles the numbers 0 through 19.
    // The elements of the array will represent the develeopment account number
    // and the index will represent the order in which that account will use ethSwap to buyTokens
    this.shuffle = [];
    while (this.shuffle.length < 20) {
      const r = Math.floor(Math.random() * 20);
      if (this.shuffle.indexOf(r) === -1) this.shuffle.push(r);
    }

    addrs = await ethers.getSigners();

    // Deploy EthSwap
    const EthSwap = await ethers.getContractFactory("EthSwap");
    this.ethSwap = await EthSwap.deploy();
    const receipt = this.ethSwap.deployTransaction.wait();
    contractBlockNumber = receipt.blockNumber;
    console.log("EthSwap deployed to:", this.ethSwap.address);

    // Instantiate Token
    let tokenAddress = await this.ethSwap.token();
    this.token = await ethers.getContractAt("Token", tokenAddress);
    console.log("Token deployed to:", this.token.address);

    // check all 1 billion tokens are in the pool
    expect(await this.token.balanceOf(this.ethSwap.address)).to.equal(
      TOTAL_TOKENS
    );

    // every account will buy 1 token in a random order
    await Promise.all(
      this.shuffle.map(async (i, index) => {
        const receipt = await (
          await this.ethSwap.connect(addrs[i]).buyTokens({ value: toWei(10) })
        ).wait();
        expect(receipt.blockNumber).to.equal(index + 2);
      })
    );

    // query the event TokenPurchased
    const filter = this.ethSwap.filters.TokensPurchased();
    const results = await this.ethSwap.queryFilter(
      filter,
      contractBlockNumber,
      blockCutoff
    );
    // expect(results.length).to.equal(blockCutoff - contractBlockNumber);

    // get all address from the event ad hash to get leaf node
    this.leafNodes = results.map((i) => keccak256(i.args.account.toString()));
    this.merkleTree = new MerkleTree(this.leafNodes, keccak256, { sort: true });
    const rootHash = this.merkleTree.getRoot();

    //deploy airdrop
    const Airdrop = await ethers.getContractFactory("Airdrop");
    this.airdrop = await Airdrop.deploy(rootHash, REWARD_AMOUNT);
    await this.airdrop.deployed();
    console.log("Airdrop deployed to:", this.airdrop.address);
  });

  it("only eligible accounts can claim the airdrop", async () => {
    for (let i = 0; i < 20; i++) {
      const proof = this.merkleTree.getHexProof(keccak256(addrs[i].address));
      if (proof.length !== 0) {
        await this.airdrop.connect(addrs[i]).claim(proof);
        expect(await this.airdrop.balanceOf(addrs[i].address)).to.equal(
          REWARD_AMOUNT
        );

        // fails if claim again
        await expect(
          this.airdrop.connect(addrs[i]).claim(proof)
        ).to.be.revertedWith("Already claimed airdrop");
      } else {
        await expect(
          this.airdrop.connect(addrs[i]).claim(proof)
        ).to.be.revertedWith("Invalid Merkle proof");
        expect(await this.airdrop.balanceOf(addrs[i].address)).to.equal(0);
      }
    }
  });
});

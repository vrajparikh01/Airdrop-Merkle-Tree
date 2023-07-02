const hre = require("hardhat");

const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

async function main() {
  addr1 = await hre.ethers.getSigner(0);

  const EthSwap = await hre.ethers.getContractFactory("EthSwap");
  let ethSwap = await EthSwap.deploy();
  await ethSwap.deployed();
  console.log("EthSwap deployed to:", ethSwap.address);

  // Instantiate Token
  let tokenAddress = await ethSwap.token();
  let token = await hre.ethers.getContractAt("Token", tokenAddress);
  console.log("Token deployed to:", token.address);

  let contractBlockNumber;
  let blockCutoff = 10;
  const REWARD_AMOUNT = hre.ethers.utils.parseEther("1000");
  const filter = ethSwap.filters.TokensPurchased();
  const results = await ethSwap.queryFilter(
    filter,
    contractBlockNumber,
    blockCutoff
  );

  let leafNodes = results.map((i) => keccak256(i.args.addr1.toString()));
  let merkleTree = new MerkleTree(leafNodes, keccak256, { sort: true });
  const rootHash = merkleTree.getRoot();

  //deploy airdrop
  const Airdrop = await hre.ethers.getContractFactory("Airdrop");
  let airdrop = await Airdrop.deploy(rootHash, REWARD_AMOUNT);
  await airdrop.deployed();
  console.log("Airdrop deployed to:", airdrop.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

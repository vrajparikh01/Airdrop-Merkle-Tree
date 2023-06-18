const hre = require("hardhat");

async function main() {
  const EthSwap = await hre.ethers.getContractFactory("EthSwap");
  let ethSwap = await EthSwap.deploy();
  await ethSwap.deployed();
  console.log("EthSwap deployed to:", ethSwap.address);

  // Instantiate Token
  let tokenAddress = await ethSwap.token();
  let token = await hre.ethers.getContractAt("Token", tokenAddress);
  console.log("Token deployed to:", token.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

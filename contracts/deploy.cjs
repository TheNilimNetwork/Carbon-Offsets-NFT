// scripts/deploy.js
// Deploys CarbonOffsetNFT contract to Sepolia testnet

const hre = require("hardhat");

async function main() {
  // Predefined admin address
  const ADMIN_ADDRESS = process.env.VITE_ADMIN_ADDRESS;

  // Get contract factory
  const CarbonOffsetNFT = await hre.ethers.getContractFactory("CarbonOffsetNFT");

  // Deploy contract with admin address as initial owner
  console.log("Deploying CarbonOffsetNFT to Sepolia...");
  const carbonOffsetNFT = await CarbonOffsetNFT.deploy();

  // Wait for deployment
  await carbonOffsetNFT.waitForDeployment();

  // Log deployed contract address
  const contractAddress = await carbonOffsetNFT.getAddress();
  console.log("CarbonOffsetNFT deployed to:", contractAddress);

  // Optional: Verify contract on Sepolia Etherscan (requires Etherscan API key)
  // await hre.run("verify:verify", {
  //   address: contractAddress,
  //   constructorArguments: [],
  // });
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
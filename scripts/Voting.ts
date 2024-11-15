import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Voting contract...");

  const VotingContract = await ethers.getContractFactory("VotingC");
  const votingContract = await VotingContract.deploy();

  await votingContract.waitForDeployment();

  console.log("Voting contract deployed to:", await votingContract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

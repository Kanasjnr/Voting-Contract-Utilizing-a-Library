import { ethers } from "hardhat";

async function main() {
  const [deployer, voter1, voter2,voter3] = await ethers.getSigners();

  
  const VotingC = await ethers.getContractFactory("VotingC");
  const votingC = await VotingC.deploy();
  await votingC.waitForDeployment();

  console.log("Contract deployed at:", votingC.target);

  
  await votingC.addCandidate("Tinubu");
  await votingC.addCandidate("Peter obi");
  console.log("Candidates added.");

  
  await votingC.startVoting();
  console.log("Voting has started.");

 
  await votingC.connect(voter1).vote(0); 
  console.log("Voter1 voted for Tinubu");

  await votingC.connect(voter2).vote(1); 
  console.log("Voter2 voted for Peter obi");

  await votingC.connect(voter3).vote(0); 
  console.log("Voter3 voted for Tinubu");

  
  await votingC.endVoting();
  console.log("Voting has ended.");

  
  const winnerName = await votingC.getWinnerName();
  console.log("Winner is:", winnerName);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import { VotingC } from "../typechain-types/VotingC";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("VotingContract", function () {
  async function deployVotingContractFixture() {
    const [owner, voter1, voter2, voter3] = await ethers.getSigners();

    const VotingContract = await ethers.getContractFactory("VotingC");
    const votingContract = await VotingContract.deploy();

    return { votingContract, owner, voter1, voter2, voter3 };
  }

  describe("Deployment", () => {
    it("Should deploy the VotingContract correctly", async function () {
      const { votingContract } = await loadFixture(deployVotingContractFixture);
      expect(await votingContract.getAddress()).to.be.properAddress;
    });

    it("Should set the right owner", async function () {
      const { votingContract, owner } = await loadFixture(
        deployVotingContractFixture
      );
      expect(await votingContract.owner()).to.equal(owner.address);
    });
  });

  describe("Candidate Management", () => {
    it("Should allow owner to add candidates", async function () {
      const { votingContract, owner } = await loadFixture(
        deployVotingContractFixture
      );

      await expect(votingContract.connect(owner).addCandidate("Candidate 1"))
        .to.emit(votingContract, "CandidateAdded")
        .withArgs("Candidate 1");

      expect(await votingContract.getCandidateCount()).to.equal(1);

      const [name, voteCount] = await votingContract.getCandidate(0);
      expect(name).to.equal("Candidate 1");
      expect(voteCount).to.equal(0);
    });

    it("Should not allow non-owner to add candidates", async function () {
      const { votingContract, voter1 } = await loadFixture(
        deployVotingContractFixture
      );

      await expect(
        votingContract.connect(voter1).addCandidate("Candidate 2")
      ).to.be.revertedWith("Only the owner can call this function.");
    });
  });

  describe("Voting Control", () => {
    it("Should allow owner to start voting", async function () {
      const { votingContract, owner } = await loadFixture(
        deployVotingContractFixture
      );

      await expect(votingContract.connect(owner).startVoting())
        .to.emit(votingContract, "VotingStatusChanged")
        .withArgs(true);

      expect(await votingContract.votingOpen()).to.be.true;
    });

    it("Should allow owner to end voting", async function () {
      const { votingContract, owner } = await loadFixture(
        deployVotingContractFixture
      );

      await votingContract.connect(owner).startVoting();

      await expect(votingContract.connect(owner).endVoting())
        .to.emit(votingContract, "VotingStatusChanged")
        .withArgs(false);

      expect(await votingContract.votingOpen()).to.be.false;
    });

    it("Should not allow non-owner to start or end voting", async function () {
      const { votingContract, voter1 } = await loadFixture(
        deployVotingContractFixture
      );

      await expect(
        votingContract.connect(voter1).startVoting()
      ).to.be.revertedWith("Only the owner can call this function.");

      await expect(
        votingContract.connect(voter1).endVoting()
      ).to.be.revertedWith("Only the owner can call this function.");
    });
  });

  describe("Voting Process", () => {
    it("Should allow voting ", async function () {
      const { votingContract, owner, voter1 } = await loadFixture(
        deployVotingContractFixture
      );

      await votingContract.connect(owner).addCandidate("Candidate 1");
      await votingContract.connect(owner).startVoting();

      await expect(votingContract.connect(voter1).vote(0))
        .to.emit(votingContract, "Voted")
        .withArgs(voter1.address, 0);

      const [, voteCount] = await votingContract.getCandidate(0);
      expect(voteCount).to.equal(1);
    });

    it("Should not allow voting twice", async function () {
      const { votingContract, owner, voter1 } = await loadFixture(
        deployVotingContractFixture
      );

      await votingContract.connect(owner).addCandidate("Candidate 1");
      await votingContract.connect(owner).startVoting();

      await votingContract.connect(voter1).vote(0);

      await expect(votingContract.connect(voter1).vote(0)).to.be.revertedWith(
        "You have already voted."
      );
    });

    it("Should not allow voting for a candidate that does not exist", async function () {
      const { votingContract, owner, voter1 } = await loadFixture(
        deployVotingContractFixture
      );

      await votingContract.connect(owner).addCandidate("Candidate 1");
      await votingContract.connect(owner).startVoting();

      await expect(votingContract.connect(voter1).vote(1)).to.be.revertedWith(
        "Invalid candidate index."
      );
    });
  });

  describe(" Winner Determination", () => {
    it("Should count votes", async function () {
      const { votingContract, owner, voter1, voter2, voter3 } =
        await loadFixture(deployVotingContractFixture);

      await votingContract.connect(owner).addCandidate("Candidate 1");
      await votingContract.connect(owner).addCandidate("Candidate 2");
      await votingContract.connect(owner).startVoting();

      await votingContract.connect(voter1).vote(0);
      await votingContract.connect(voter2).vote(1);
      await votingContract.connect(voter3).vote(1);

      const [, voteCount1] = await votingContract.getCandidate(0);
      const [, voteCount2] = await votingContract.getCandidate(1);

      expect(voteCount1).to.equal(1);
      expect(voteCount2).to.equal(2);
    });

    it("Should  determine the winner", async function () {
      const { votingContract, owner, voter1, voter2, voter3 } =
        await loadFixture(deployVotingContractFixture);

      await votingContract.connect(owner).addCandidate("Candidate 1");
      await votingContract.connect(owner).addCandidate("Candidate 2");
      await votingContract.connect(owner).startVoting();

      await votingContract.connect(voter1).vote(0);
      await votingContract.connect(voter2).vote(1);
      await votingContract.connect(voter3).vote(1);

      await votingContract.connect(owner).endVoting();

      expect(await votingContract.getWinnerName()).to.equal("Candidate 2");
    });
  });
});

// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.27;

import "./library/Voting.lib.sol";


contract VotingC {
    using VotingLib for VotingLib.VotingState;

    VotingLib.VotingState private votingState;
    address public owner;
    bool public votingOpen;

    event CandidateAdded(string name);
    event Voted(address voter, uint256 candidateIndex);
    event VotingStatusChanged(bool isOpen);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

   
    constructor() {
        owner = msg.sender;
    }

    function addCandidate(string memory _name) public onlyOwner {
        votingState.addCandidate(_name);
        emit CandidateAdded(_name);
    }

    function startVoting() public onlyOwner {
        votingOpen = true;
        emit VotingStatusChanged(true);
    }

    function endVoting() public onlyOwner {
        votingOpen = false;
        emit VotingStatusChanged(false);
    }

    function vote(uint256 _candidateIndex) public  {
        votingState.vote(_candidateIndex);
        emit Voted(msg.sender, _candidateIndex);
    }

    function getWinnerName() public view returns (string memory) {
        require(!votingOpen, "Voting is still open.");
        return votingState.getWinnerName();
    }

    function getCandidateCount() public view returns (uint256) {
        return votingState.candidates.length;
    }

    function getCandidate(uint256 _index) public view returns (string memory name, uint256 voteCount) {
        require(_index < votingState.candidates.length, "Invalid candidate index.");
        VotingLib.Candidate storage candidate = votingState.candidates[_index];
        return (candidate.name, candidate.voteCount);
    }
}
// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.27;

library VotingLib {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    struct VotingState {
        mapping(address => bool) hasVoted;
        Candidate[] candidates;
    }

    function addCandidate(
        VotingState storage self,
        string memory _name
    ) internal {
        self.candidates.push(Candidate({name: _name, voteCount: 0}));
    }

    function vote(VotingState storage self, uint256 _candidateIndex) internal {
        require(!self.hasVoted[msg.sender], "You have already voted.");
        require(
            _candidateIndex < self.candidates.length,
            "Invalid candidate index."
        );

        self.candidates[_candidateIndex].voteCount++;
        self.hasVoted[msg.sender] = true;
    }

    function getWinningCandidate(
        VotingState storage self
    ) internal view returns (uint256 winningIndex) {
        uint256 winningVoteCount = 0;
        for (uint256 i = 0; i < self.candidates.length; i++) {
            if (self.candidates[i].voteCount > winningVoteCount) {
                winningVoteCount = self.candidates[i].voteCount;
                winningIndex = i;
            }
        }
    }

    function getWinnerName(
        VotingState storage self
    ) internal view returns (string memory winnerName) {
        winnerName = self.candidates[getWinningCandidate(self)].name;
    }
}

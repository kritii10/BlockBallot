// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Voting {
    address public admin;

    struct Candidate {
        string name;
        uint256 voteCount;
    }

    Candidate[] private candidates;

    mapping(address => bool) public registeredVoters;
    mapping(address => bool) public hasVoted;
    mapping(uint256 => bool) public candidateExists;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only the admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerVoter(address voter) external onlyAdmin {
        require(!registeredVoters[voter], "Voter is already registered");
        registeredVoters[voter] = true;
    }

    function registerCandidate(string memory name) external onlyAdmin {
        require(bytes(name).length > 0, "Candidate name is required");

        uint256 candidateId = candidates.length;
        candidates.push(Candidate({name: name, voteCount: 0}));
        candidateExists[candidateId] = true;
    }

    function vote(uint256 candidateId) external {
        require(registeredVoters[msg.sender], "Voter is not registered");
        require(!hasVoted[msg.sender], "Voter has already voted");
        require(candidateExists[candidateId], "Candidate does not exist");

        hasVoted[msg.sender] = true;
        candidates[candidateId].voteCount += 1;
    }

    function getCandidates() external view returns (Candidate[] memory) {
        return candidates;
    }

    function getVoteCount(uint256 candidateId) external view returns (uint256) {
        require(candidateExists[candidateId], "Candidate does not exist");
        return candidates[candidateId].voteCount;
    }

    function getWinner() external view returns (string memory winnerName, uint256 winnerVotes) {
        require(candidates.length > 0, "No candidates registered");

        Candidate memory winner = candidates[0];

        for (uint256 i = 1; i < candidates.length; i++) {
            if (candidates[i].voteCount > winner.voteCount) {
                winner = candidates[i];
            }
        }

        return (winner.name, winner.voteCount);
    }
}

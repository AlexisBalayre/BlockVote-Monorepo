// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

interface IPoll {
    error YouAreUsingTheSameNillifierTwice();
    error PollHasNotStartedYet();
    error PollHasEnded();

    enum PollState {
        Created,
        Ongoing,
        Ended
    }

    struct PollData {
        bytes32[] options;
        string name;
        uint256 totalVotesAmount;
        uint256 startTimestamp;
        uint256 endTimestamp;
    }
    
    struct OptionData {
        string option;
        uint256 voteIndex;
    }
}
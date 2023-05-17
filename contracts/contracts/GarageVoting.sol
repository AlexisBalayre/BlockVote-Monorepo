// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

import "./semaphore/interfaces/ISemaphoreVoting.sol";
import "./semaphore/interfaces/ISemaphoreVerifier.sol";
import "./semaphore/base/SemaphoreGroups.sol";

import "./Poll.sol";
import "./interfaces/IGarageVoting.sol";

/**
 * @title GarageVoting Contract
 * @notice The contract for creating and managing polls on the Ethereum blockchain
 * Each vote is encrypted using a zero-knowledge proof to ensure privacy and prevent double-voting.
 */
contract GarageVoting is IGarageVoting, SemaphoreGroups, AccessControl {
    using EnumerableSet for EnumerableSet.AddressSet;

    // Set of addresses for the poll contracts
    EnumerableSet.AddressSet private pollContracts;

    // The Semaphore verifier used to verify the user's ZK proofs
    ISemaphoreVerifier public verifier;

    // Role for admins
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Depth of the Merkle Tree
    uint256 private merkleTreeDepth;

    // Address of the poll contract implementation
    address public pollContractImplementation;

    /**
     * @dev Initializes the Semaphore verifier used to verify the user's ZK proofs.
     * @param _verifier Semaphore verifier address.
     */
    constructor(ISemaphoreVerifier _verifier) {
        verifier = _verifier;
        merkleTreeDepth = 20;
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _grantRole(ADMIN_ROLE, _msgSender());
        pollContractImplementation = address(new Poll());
    }
    

    /**
     * @notice Returns the Merkle Tree Data of a poll.
     * @param _pollID Id of the poll.
     * @return _merkleTreeDepth Depth of the Merkle tree.
     * @return _merkleTreeRoot Root of the Merkle tree.
     */
    function getMerkleTreeData(uint256 _pollID) external view returns (uint256 _merkleTreeDepth, uint256 _merkleTreeRoot) {
        _merkleTreeDepth = getMerkleTreeDepth(_pollID);
        _merkleTreeRoot = getMerkleTreeRoot(_pollID);
    }

    /**
     * @notice Returns the address of the poll contract
     * @param _pollID Id of the poll.
     * @return _pollContract Address of the poll contract.
     */
    function getPollContract(uint256 _pollID) external view returns (address _pollContract) {
        _pollContract = pollContracts.at(_pollID);
    }

    /**
     * @notice Returns the amount of polls.
     * @return _pollsAmount Amount of polls.
     */
    function getPollsAmount() external view returns (uint256 _pollsAmount) {
        _pollsAmount = pollContracts.length();
    }

    /**
     * @notice Sets the Poll contract implementation.
     * @param _newPollContractImplementation New address for the Poll contract implementation.
     */
    function setPollContractImplementation(
        address _newPollContractImplementation
    ) external {
        if (hasRole(ADMIN_ROLE, _msgSender()) == false) {
            revert AccessRestricted(_msgSender());
        }
        pollContractImplementation = _newPollContractImplementation;
        emit PollContractImplementationChanged(_newPollContractImplementation);
    }

    /**
     * @notice Sets the depth of the Merkle tree.
     * @param _merkleTreeDepth New depth for the Merkle tree.
     */
    function setMerkleTreeDepth(uint256 _merkleTreeDepth) external {
        if (hasRole(ADMIN_ROLE, _msgSender()) == false) {
            revert AccessRestricted(_msgSender());
        }
        merkleTreeDepth = _merkleTreeDepth;
        emit MerkleTreeDepthChanged(_merkleTreeDepth);
    }

    /**
     * @notice Sets the Semaphore verifier.
     * @param _verifier New address for the Semaphore verifier.
     */
    function setVerifier(ISemaphoreVerifier _verifier) external {
        if (hasRole(ADMIN_ROLE, _msgSender()) == false) {
            revert AccessRestricted(_msgSender());
        }
        verifier = _verifier;
        emit VerifierContractChanged(address(_verifier));
    }

    /**
     * @notice Creates a poll and the associated Merkle tree/group.
     * @param _options Options for the poll.
     * @param _name Name of the poll.
     * @param _startTimestamp Start timestamp of the poll.
     * @param _endTimestamp End timestamp of the poll.
     */
    function createPoll(
        string[] calldata _options,
        string calldata _name,
        uint256 _startTimestamp,
        uint256 _endTimestamp
    ) external {
        if (hasRole(ADMIN_ROLE, _msgSender()) == false) {
            revert AccessRestricted(_msgSender());
        }

        if (_options.length <= 1) {
            revert InvalidOptions();
        }

        if (_startTimestamp >= _endTimestamp) {
            revert InvalidTimestamps();
        }

        uint256 pollId = pollContracts.length() + 1;
        address clone = Clones.clone(pollContractImplementation);
        Poll(clone).initialize(
            _options, 
            _name,
            pollId,
            _startTimestamp, 
            _endTimestamp
        );
        pollContracts.add(clone);

        _createGroup(pollId, merkleTreeDepth);

        emit PollCreated(pollId, _msgSender());
    }

    /**
     * @notice Adds a voter to a poll.
     * @param _pollId Id of the poll.
     * @param _identityCommitment Identity commitment of the voter.
     */
    function addVoter(
        uint256 _pollId,
        uint256 _identityCommitment
    ) external {
        if (hasRole(ADMIN_ROLE, _msgSender()) == false) {
            revert AccessRestricted(_msgSender());
        }

        if (pollContracts.length() < _pollId) {
            revert PollDoesNotExist(_pollId);
        }

        _addMember(_pollId, _identityCommitment);

        emit VoterAdded(_pollId, _identityCommitment);
    }
}

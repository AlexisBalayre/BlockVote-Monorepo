// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "./interfaces/IFactory.sol";

contract Vote {
    IFactory public adminContract;
    string[] public options;
    mapping(uint256 => uint256) public optionCounter;

    function initialize(
        string[] calldata _options
	) public initializer {
        adminContract = IFactory(msg.sender);
        options = _options;
	}

    error NotAuthorized(address _caller);
    error InvalidIndex(uint256 _index);

    function registerCommitment(
        uint256 _commitment
    ) external {
        if (!adminContract.isValidator(msg.sender)) revert NotAuthorized(msg.sender);
        // TODO
    }

}

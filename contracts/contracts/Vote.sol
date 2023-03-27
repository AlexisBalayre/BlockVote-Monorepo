// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.17;

import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

import "./interfaces/IFactory.sol";

contract Vote is Initializable {
    IFactory public adminContract;
    bytes32[] private options;
    mapping(bytes32 => uint256) private optionCounter;
    string public name;

    function getOptions() external view returns (string[] memory _options) {
        _options = new string[](options.length);
        for (uint256 i = 0; i < options.length; ++i) {
            _options[i] = bytes32ToString(options[i]);
        }
    }

    function getOptionCounter(string calldata _option) external view returns (uint256 _optionCounter) {
        _optionCounter = optionCounter[stringToBytes32(_option)];
    }

    function getAllOptionCounter() external view returns (uint256 _optionCounter, string memory _option) {
        for (uint256 i = 0; i < options.length; ++i) {
            _optionCounter = optionCounter[options[i]];
            _option = bytes32ToString(options[i]);
        }
    }

    function initialize(
        string[] calldata _options
	) public initializer {
        for (uint256 i = 0; i < _options.length; ++i) {
           options.push(stringToBytes32(_options[i]));
        }
        adminContract = IFactory(msg.sender);
	}

    struct Result {
        bytes32 option;
        uint256 count;
    }

    function getResult() external view returns (Result[] memory result) {
        result = new Result[](options.length);
        for (uint256 i = 0; i < options.length; i++) {
            result[i] = Result(options[i], optionCounter[options[i]]);
        }
    }

    function bytes32ToString(bytes32 source) internal pure returns (string memory) {
        uint256 length;
        for (uint256 i = 0; i < 32; i++) {
            if (source[i] == 0) {
                length = i;
                break;
            }
        }
        bytes memory result = new bytes(length);
        for (uint256 i = 0; i < length; i++) {
            result[i] = source[i];
        }
        return string(result);
    }

    function stringToBytes32(string memory source) internal pure returns (bytes32 result) {
        assembly {
            result := mload(add(source, 32))
        }
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

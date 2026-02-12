// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title DeadDropNFT
/// @notice NFT reward for solving DeadDrop mysteries
contract DeadDropNFT is ERC721URIStorage, Ownable {
    uint256 public tokenCount;

    address public registry;

    modifier onlyRegistry() {
        require(msg.sender == registry, "Only registry allowed");
        _;
    }

    constructor(address _registry)
        ERC721("DeadDrop Badge", "DDROP")
    {
        registry = _registry;
    }

    /// @notice Mint an NFT to a mystery solver
    /// @param _to solver address
    /// @param _tokenURI metadata URI (can include mysteryId, time, etc.)
    function mintReward(
        address _to,
        string calldata _tokenURI
    ) external onlyRegistry {
        tokenCount++;

        _safeMint(_to, tokenCount);
        _setTokenURI(tokenCount, _tokenURI);
    }
}

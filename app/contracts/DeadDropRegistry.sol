// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title DeadDropRegistry
/// @notice Stores cryptographic commitments for AI-generated mysteries
///         and verifies player solutions on-chain.
contract DeadDropRegistry {
    struct Mystery {
        bytes32 answerHash;      // keccak256(mysteryId, culprit, salt)
        uint256 createdAt;       // block timestamp
        bool solved;
        address solver;
        uint256 solveTime;       // seconds taken to solve
    }

    uint256 public mysteryCount;
    mapping(uint256 => Mystery) public mysteries;

    address public owner;

    event MysteryCreated(
        uint256 indexed mysteryId,
        bytes32 answerHash
    );

    event MysterySolved(
        uint256 indexed mysteryId,
        address indexed solver,
        uint256 solveTime
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Create a new mystery with a committed solution hash
    /// @param _answerHash keccak256(mysteryId, culprit, salt)
    function createMystery(bytes32 _answerHash) external onlyOwner {
        mysteryCount++;

        mysteries[mysteryCount] = Mystery({
            answerHash: _answerHash,
            createdAt: block.timestamp,
            solved: false,
            solver: address(0),
            solveTime: 0
        });

        emit MysteryCreated(mysteryCount, _answerHash);
    }

    /// @notice Submit a solution for a mystery
    /// @param _mysteryId ID of the mystery
    /// @param _culprit guessed culprit
    /// @param _salt secret salt used during commitment
    function solveMystery(
        uint256 _mysteryId,
        string calldata _culprit,
        string calldata _salt
    ) external {
        Mystery storage m = mysteries[_mysteryId];

        require(!m.solved, "Mystery already solved");

        bytes32 guessHash = keccak256(
            abi.encodePacked(_mysteryId, _culprit, _salt)
        );

        require(guessHash == m.answerHash, "Incorrect solution");

        m.solved = true;
        m.solver = msg.sender;
        m.solveTime = block.timestamp - m.createdAt;

        emit MysterySolved(_mysteryId, msg.sender, m.solveTime);
    }
}

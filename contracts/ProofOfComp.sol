// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MysteryProof {
    event GameCompleted(
        address indexed player,
        string caseId,
        uint256 timeTaken,
        bool solved
    );

    function recordGame(
        string calldata caseId,
        uint256 timeTaken,
        bool solved
    ) external {
        emit GameCompleted(msg.sender, caseId, timeTaken, solved);
    }
}

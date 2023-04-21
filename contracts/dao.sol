// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TaskContract {
    address public employer;
    address public employee;
    uint256 public reward;
    uint256 public deadline;
    string public taskDescription;
    string public taskName;
    bool public completed;
    bool public cancelled;
    bool public activated;
    IERC20 public busdToken;

    constructor(
        address _employee,
        uint256 _reward,
        uint256 _deadline,
        address _employer,
        string memory _taskName,
        string memory _taskDescription,
        address _busdToken
    ) {
        employer = _employer;
        employee = _employee;
        reward = _reward;
        deadline = _deadline;
        taskName = _taskName;
        taskDescription = _taskDescription;
        completed = false;
        cancelled = false;
        activated = false;
        busdToken = IERC20(_busdToken);
    }

    function activateTask() public {
        require(
            busdToken.transferFrom(employer, address(this), reward),
            "Transfer failed"
        );
        require(msg.sender == employer, "Only hirer can activate the task");
        require(!activated, "Task already activated");
        activated = true;
    }

    function isCompleted() public view returns (bool) {
        return completed;
    }

    function viewReward() public view returns (uint256) {
        return reward;
    }

    function isActivated() public view returns (bool) {
        return activated;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }


    function isCancelled() public view returns (bool) {
        return cancelled;
    }

    function getDescription() public view returns (string memory) {
        return taskDescription;
    }

    function completeTask() public {
        require(
            msg.sender == employee,
            "Only the employee can complete the task"
        );
        require(block.timestamp <= deadline, "Deadline has passed");
        require(!cancelled, "Task has been cancelled");

        completed = true;
        busdToken.transfer(employee, reward);
    }

    function cancelTask() public {
        require(msg.sender == employee, "Only the employee can cancel the task");
        require(!completed, "Task has already been completed");

        cancelled = true;
        busdToken.transfer(employer, reward);
    }
}
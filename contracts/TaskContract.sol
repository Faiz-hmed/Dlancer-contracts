// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

contract askContract {
    address public employer;
    address public employee;
    uint256 public reward;
    uint256 public deadline;
    string public taskDescription;
    bool public completed;
    bool public cancelled;
    bool public activated;
    constructor(address _employee, uint _reward, uint _deadline,address _employer, string memory _taskDescription) payable {
        employer = _employer;
        employee = _employee;
        reward = _reward;
        deadline = _deadline;
        taskDescription = _taskDescription;
        completed = false;
        cancelled = false;
        activated = false;
    }

    function activateTask() public payable {
        require(msg.value == reward, "Amount sent must be equal to the reward");
        require(msg.sender == employer, "Only hirer can activate the task");
        require(activated == false, "Task already activated");
        activated = true;
    }

    function isCompleted() public view returns(bool){
        return completed;
    }

    function viewReward() public view returns(uint256){
        return reward;
    }

    function isActivated() public view returns(bool){
        return activated;
    }

    function isCancelled() public view returns(bool){
        return cancelled;
    }

    function getDescription() public view returns(string memory){
        return taskDescription;
    }

    function completeTask() public {
        // require(msg.sender == employee, "Only the employee can complete the task");
        require(block.timestamp <= deadline, "Deadline has passed");
        require(!cancelled, "Task has been cancelled");

        completed = true;
        payable(employee).transfer(reward);
    }

    function cancelTask() public {
        require(msg.sender == employee, "Only the employee can cancel the task");
        require(!completed, "Task has already been completed");

        cancelled = true;
        payable(employer).transfer(reward);
    }
}
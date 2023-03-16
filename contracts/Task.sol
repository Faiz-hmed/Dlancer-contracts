// SPDX-License-Identifier: MIT
// pragma solidity ^0.8.8;


// contract fundme{
//     uint256 minprice = 50*10e18;
//     function fund() public payable{
//         require(msg.value>=minprice,"dint get enough");
//     }
//     function getversion() public view returns(uint256){
//         return minprice;
//     }
// }



pragma solidity ^0.8.8;

contract TaskContract {
    address public employer;
    address public employee;
    uint256 public reward;
    uint256 public deadline;
    string public taskDescription;
    bool public completed;
    bool public cancelled;
    constructor(address _employee, uint _reward, uint _deadline, string memory _taskDescription) payable {
        employer = msg.sender;
        employee = _employee;
        reward = _reward;
        deadline = _deadline;
        taskDescription = _taskDescription;
        completed = false;
        cancelled = false;
    }

    function activateTask(uint _reward) public payable {
        reward = _reward;
        require(msg.value == _reward, "Amount sent must be equal to the reward");
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

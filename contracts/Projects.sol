// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

contract ProjectContract {
    struct Task {
        address employer;
        address employee;
        uint256 reward;
        uint256 deadline;
        bool completed;
        bool cancelled;
    }

    mapping(uint256 => Task) public tasks;
    uint256 public taskCounter;

    function createTask(address _employee, uint _reward, uint _deadline) public payable returns(uint256){
        require(msg.value == _reward, "Amount sent must be equal to the reward");
        tasks[taskCounter] = Task({
            employer: msg.sender,
            employee: _employee,
            reward: _reward,
            deadline: _deadline,
            completed: false,
            cancelled: false
        });
        taskCounter++;
        return taskCounter-1;
    }


    function completeTask(uint256 _taskId) public {
        Task storage task = tasks[_taskId];
        require(msg.sender == task.employee, "Only the employee can complete the task");
        require(block.timestamp <= task.deadline, "Deadline has passed");
        require(!task.cancelled, "Task has been cancelled");
        require(!task.completed, "Task has already been completed");

        task.completed = true;
        payable(task.employee).transfer(task.reward);
    }

    function getReward(uint256 _taskId)public view returns(uint256){
        Task storage task =  tasks[_taskId];
        return task.reward;
    }

    function cancelTask(uint256 _taskId) public {
        Task storage task = tasks[_taskId];
        require(msg.sender == task.employee, "Only the employee can cancel the task");
        require(!task.completed, "Task has already been completed");
        require(!task.cancelled, "Task has been cancelled");
        task.cancelled = true;
        payable(task.employer).transfer(task.reward);
    }
}